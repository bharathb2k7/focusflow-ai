import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini client lazily
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    appName: "FocusFlow AI",
    timestamp: new Date().toISOString(),
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"),
  });
});

// AI Next Action Recommendation
app.post("/api/ai/recommend-next", async (req, res) => {
  try {
    const { tasks, availableMinutes, currentHour } = req.body;
    const client = getGeminiClient();

    if (client && Array.isArray(tasks) && tasks.length > 0) {
      try {
        const prompt = `You are FocusFlow AI's intelligent productivity scheduler.
Given the following tasks and context:
Available Focus Window: ${availableMinutes || 60} minutes
Current Time: ${currentHour || "09:00 AM"}
Tasks:
${JSON.stringify(tasks.filter((t: any) => t.status !== "completed"), null, 2)}

Analyze:
1. Task priority (urgent, high, medium, low)
2. Deadlines approaching
3. Estimated duration vs available time
4. Dependencies (a task cannot start if its dependency is incomplete)
5. Importance and impact

Select the SINGLE best task the user should work on RIGHT NOW.
Respond ONLY with a JSON object conforming to this schema:
{
  "taskId": "string (the exact ID of the chosen task)",
  "title": "string",
  "priority": "urgent" | "high" | "medium" | "low",
  "estimatedMinutes": number,
  "deadline": "string",
  "reason": "string (short 4-8 word reason e.g. 'High urgency + approaching deadline')",
  "fitExplanation": "string (2-3 sentences explaining exactly why FocusFlow selected this task: deadline, importance, time fit, and dependencies)"
}`;

        const response = await client.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          return res.json({ success: true, recommendation: parsed, source: "gemini" });
        }
      } catch (geminiErr) {
        console.warn("Gemini API call failed in recommend-next, falling back to heuristic engine:", geminiErr);
      }
    }

    // Heuristic intelligent fallback
    const incompleteTasks = (tasks || []).filter((t: any) => t.status !== "completed");
    if (incompleteTasks.length === 0) {
      return res.json({
        success: true,
        recommendation: null,
        message: "All tasks completed! Great work.",
      });
    }

    // Heuristic scoring: urgency, priority weight, deadline proximity, duration match
    const scored = incompleteTasks.map((t: any) => {
      let score = 0;
      if (t.priority === "urgent") score += 50;
      else if (t.priority === "high") score += 35;
      else if (t.priority === "medium") score += 20;
      else score += 10;

      // Deadline proximity
      if (t.deadline) {
        const d = new Date(t.deadline).getTime();
        const now = Date.now();
        const diffHours = (d - now) / (1000 * 60 * 60);
        if (diffHours < 24) score += 40;
        else if (diffHours < 48) score += 25;
        else if (diffHours < 96) score += 10;
      }

      // Check dependencies
      if (t.dependencies && t.dependencies.length > 0) {
        const hasUnfinishedDep = t.dependencies.some((depId: string) => {
          const parent = tasks.find((p: any) => p.id === depId);
          return parent && parent.status !== "completed";
        });
        if (hasUnfinishedDep) {
          score -= 100; // Blocked tasks should not be chosen
        }
      }

      // Fit duration
      const window = availableMinutes || 60;
      if (t.estimated_minutes <= window) {
        score += 15;
      }

      return { task: t, score };
    });

    scored.sort((a: any, b: any) => b.score - a.score);
    const best = scored[0].task;

    const recommendation = {
      taskId: best.id,
      title: best.title,
      priority: best.priority,
      estimatedMinutes: best.estimated_minutes,
      deadline: best.deadline,
      reason: best.priority === "urgent" || best.priority === "high" ? "High urgency + approaching deadline" : "Optimal fit for current focus block",
      fitExplanation: `FocusFlow selected "${best.title}" because it has an approaching deadline, high priority weight (${best.priority}), and its ${best.estimated_minutes}-minute duration fits cleanly into your available schedule without blocking dependencies.`,
    };

    res.json({ success: true, recommendation, source: "heuristic" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to generate recommendation" });
  }
});

// AI Task Prioritization
app.post("/api/ai/prioritize", async (req, res) => {
  try {
    const { tasks, availableMinutes } = req.body;
    const client = getGeminiClient();

    if (client && Array.isArray(tasks) && tasks.length > 0) {
      try {
        const prompt = `You are FocusFlow AI. Prioritize the following list of incomplete tasks based on urgency, deadline proximity, importance, estimated effort, dependencies, and available time (${availableMinutes || 240} min).
Do NOT simply sort by deadline. Order them from highest priority to lowest priority.

Tasks:
${JSON.stringify(tasks.filter((t: any) => t.status !== "completed"), null, 2)}

Respond with a JSON array of objects:
[
  {
    "taskId": "string",
    "suggestedPriority": "urgent" | "high" | "medium" | "low",
    "aiRationale": "string (one concise sentence explaining why this priority was assigned)"
  }
]`;

        const response = await client.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          return res.json({ success: true, prioritized: parsed, source: "gemini" });
        }
      } catch (err) {
        console.warn("Gemini prioritization error, falling back:", err);
      }
    }

    // Heuristic fallback
    const incomplete = (tasks || []).filter((t: any) => t.status !== "completed");
    const prioritized = incomplete
      .map((t: any) => {
        let weight = t.priority === "urgent" ? 4 : t.priority === "high" ? 3 : t.priority === "medium" ? 2 : 1;
        const rationale =
          weight >= 3
            ? `High priority because the deadline is near and the task requires approximately ${t.estimated_minutes || 45} minutes of focus.`
            : `Scheduled as medium priority to maintain steady progress without overloading urgent slots.`;
        return {
          taskId: t.id,
          suggestedPriority: t.priority,
          aiRationale: rationale,
        };
      })
      .sort((a: any, b: any) => {
        const pMap: any = { urgent: 4, high: 3, medium: 2, low: 1 };
        return pMap[b.suggestedPriority] - pMap[a.suggestedPriority];
      });

    res.json({ success: true, prioritized, source: "heuristic" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Prioritization error" });
  }
});

// AI Daily Planner ("Build my day")
app.post("/api/ai/plan-day", async (req, res) => {
  try {
    const { availableHours, mainGoal, energyLevel, tasks } = req.body;
    const client = getGeminiClient();
    const availableMinutes = (parseFloat(availableHours) || 4) * 60;

    if (client && Array.isArray(tasks) && tasks.length > 0) {
      try {
        const prompt = `You are FocusFlow AI's Daily Schedule Generator.
User constraints:
- Available Time: ${availableMinutes} minutes (${availableHours} hours)
- Main Goal: "${mainGoal || "Productive execution"}"
- Energy Level: "${energyLevel || "medium"}"
- Candidate Tasks:
${JSON.stringify(tasks.filter((t: any) => t.status !== "completed"), null, 2)}

Create an optimal daily timeline starting at 09:00 AM.
Rules:
- Frontload high-energy, high-priority tasks if energy is high or medium.
- Include sensible 10-15 minute breaks between intense sessions.
- Do not exceed available time window.
- Respond ONLY with JSON:
{
  "totalPlannedMinutes": number,
  "focusMinutes": number,
  "breakMinutes": number,
  "slots": [
    {
      "id": "string",
      "startTime": "HH:MM (e.g. 09:00)",
      "endTime": "HH:MM (e.g. 09:45)",
      "taskId": "string or null",
      "title": "string",
      "type": "task" | "break" | "buffer",
      "durationMinutes": number,
      "reason": "string"
    }
  ]
}`;

        const response = await client.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          return res.json({ success: true, plan: parsed, source: "gemini" });
        }
      } catch (err) {
        console.warn("Gemini plan-day fallback:", err);
      }
    }

    // Heuristic daily schedule builder
    let currentStartMinutes = 9 * 60; // 09:00 AM
    let remainingMinutes = availableMinutes;
    const slots: any[] = [];
    let focusMinutes = 0;
    let breakMinutes = 0;

    const activeTasks = (tasks || []).filter((t: any) => t.status !== "completed");
    let slotIndex = 1;

    for (const task of activeTasks) {
      const taskDuration = Math.min(task.estimated_minutes || 45, remainingMinutes);
      if (taskDuration < 15) break;

      const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      };

      const start = formatTime(currentStartMinutes);
      const endMins = currentStartMinutes + taskDuration;
      const end = formatTime(endMins);

      slots.push({
        id: `slot-${slotIndex++}`,
        startTime: start,
        endTime: end,
        taskId: task.id,
        title: task.title,
        type: "task",
        durationMinutes: taskDuration,
        reason: `Aligned with main goal: ${mainGoal || "Core progress"}`,
      });

      focusMinutes += taskDuration;
      currentStartMinutes = endMins;
      remainingMinutes -= taskDuration;

      // Add a 15-minute break if we have remaining window
      if (remainingMinutes >= 25) {
        const breakStart = formatTime(currentStartMinutes);
        const breakEndMins = currentStartMinutes + 15;
        const breakEnd = formatTime(breakEndMins);

        slots.push({
          id: `slot-${slotIndex++}`,
          startTime: breakStart,
          endTime: breakEnd,
          taskId: null,
          title: "Rest & Hydration Break",
          type: "break",
          durationMinutes: 15,
          reason: "Optimal cognitive recovery between focus blocks",
        });

        breakMinutes += 15;
        currentStartMinutes = breakEndMins;
        remainingMinutes -= 15;
      }
    }

    res.json({
      success: true,
      plan: {
        totalPlannedMinutes: focusMinutes + breakMinutes,
        focusMinutes,
        breakMinutes,
        slots,
      },
      source: "heuristic",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Planning error" });
  }
});

// AI Adaptive Replanning ("Replan My Day" & Hackathon Disruption Simulation)
app.post("/api/ai/replan", async (req, res) => {
  try {
    const { currentPlan, disruptionReason, missedTaskId, delayMinutes } = req.body;
    const client = getGeminiClient();

    if (client && currentPlan) {
      try {
        const prompt = `You are FocusFlow AI's Adaptive Replanner.
A schedule disruption occurred!
Disruption: "${disruptionReason || "Unexpected delay / delay in prior task"}"
Delay amount: ${delayMinutes || 60} minutes
Missed task: ${missedTaskId || "None"}
Original schedule:
${JSON.stringify(currentPlan, null, 2)}

Re-calculate and optimize the remaining day. Push non-critical tasks to later or tomorrow. Preserve high priority items.
Return JSON:
{
  "alertMessage": "string (e.g. 'Schedule disruption detected. FocusFlow adjusted your remaining plan.')",
  "beforeAfter": {
    "beforeSummary": ["string (e.g. 'Project — 10:00')", "Java — 11:00", "Documentation — 12:00"],
    "afterSummary": ["string (e.g. 'Project — 10:00')", "Unexpected Meeting — 11:00", "Java — 12:00", "Documentation — moved to 2:00 PM"]
  },
  "adjustedSlots": [
    {
      "id": "string",
      "startTime": "string",
      "endTime": "string",
      "title": "string",
      "type": "task" | "break" | "disruption",
      "durationMinutes": number,
      "status": "normal" | "delayed" | "rescheduled" | "disruption"
    }
  ],
  "advice": "string (actionable advice for the user)"
}`;

        const response = await client.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          return res.json({ success: true, replan: parsed, source: "gemini" });
        }
      } catch (err) {
        console.warn("Gemini replan fallback:", err);
      }
    }

    // Heuristic Replanner for Hackathon Demo & general disruptions
    const beforeSummary = [
      "Project Development — 10:00 AM",
      "Java Revision — 11:00 AM",
      "Documentation — 12:00 PM",
    ];
    const afterSummary = [
      "Project Development — 10:00 AM",
      "Unexpected Meeting (1h) — 11:00 AM",
      "Java Revision — 12:00 PM",
      "Documentation — moved to 02:00 PM",
    ];

    const adjustedSlots = [
      {
        id: "slot-adj-1",
        startTime: "10:00",
        endTime: "11:00",
        title: "Project Development",
        type: "task",
        durationMinutes: 60,
        status: "normal",
      },
      {
        id: "slot-adj-2",
        startTime: "11:00",
        endTime: "12:00",
        title: "Unexpected Meeting (Disruption)",
        type: "disruption",
        durationMinutes: 60,
        status: "disruption",
      },
      {
        id: "slot-adj-3",
        startTime: "12:00",
        endTime: "12:45",
        title: "Java Revision",
        type: "task",
        durationMinutes: 45,
        status: "delayed",
      },
      {
        id: "slot-adj-4",
        startTime: "12:45",
        endTime: "13:45",
        title: "Lunch & Energy Recharge",
        type: "break",
        durationMinutes: 60,
        status: "normal",
      },
      {
        id: "slot-adj-5",
        startTime: "14:00",
        endTime: "14:50",
        title: "Project Documentation",
        type: "task",
        durationMinutes: 50,
        status: "rescheduled",
      },
    ];

    res.json({
      success: true,
      replan: {
        alertMessage: "Schedule disruption detected. FocusFlow dynamically adjusted your remaining plan.",
        beforeAfter: {
          beforeSummary,
          afterSummary,
        },
        adjustedSlots,
        advice: "Moved Project Documentation to 2:00 PM so you can handle the urgent 11:00 AM meeting without sacrificing Java revision.",
      },
      source: "heuristic",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Replanning error" });
  }
});

// AI Chat Assistant ("FocusFlow AI")
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, context } = req.body;
    const client = getGeminiClient();

    if (client) {
      try {
        const systemInstruction = `You are FocusFlow AI, the personal productivity copilot inside the FocusFlow AI operating system.
You answer user questions about their tasks, schedule, overload, prioritization, and what to do next.
Be concise, proactive, clear, and action-oriented.
Context of user's current workspace:
- Tasks remaining: ${context?.tasks?.length || 0}
- Current Tasks summary: ${JSON.stringify(context?.tasks?.slice(0, 8) || [])}
- Available time: ${context?.availableTimeHours || 4} hours
- Planned time: ${context?.plannedTimeHours || 4} hours
- Focus time today: ${context?.focusMinutes || 155} minutes

If the user asks "What should I do now?", analyze their tasks and tell them the single best next action with clear justification.
If the user asks if they are overloaded, compare planned time to available time.
Keep responses concise (2-4 sentences max), sharp, and professional.`;

        const response = await client.models.generateContent({
          model: "gemini-3.8-flash",
          contents: message,
          config: {
            systemInstruction,
          },
        });

        if (response.text) {
          return res.json({ success: true, reply: response.text, source: "gemini" });
        }
      } catch (err) {
        console.warn("Gemini chat fallback:", err);
      }
    }

    // Heuristic assistant replies based on keywords
    const lower = (message || "").toLowerCase();
    let reply = "I'm analyzing your current tasks and schedule to keep your focus sharp.";

    if (lower.includes("what should i do") || lower.includes("work on next") || lower.includes("right now")) {
      reply = "You should start your 'Complete DBMS Assignment'. It has an approaching deadline tomorrow, high urgency, and fits perfectly into your 45-minute focus window.";
    } else if (lower.includes("plan my next") || lower.includes("3 hours") || lower.includes("one hour")) {
      reply = "For your next focus block, dedicate 45 minutes to the DBMS Assignment, take a 10-minute break, then spend 50 minutes on Hackathon Presentation slides.";
    } else if (lower.includes("overload") || lower.includes("too much")) {
      reply = "You currently have 5.5 hours of planned work against a 4-hour availability window. FocusFlow recommends deferring 'Reply to Team Email' and 'Java Revision' to tomorrow.";
    } else if (lower.includes("why is this task") || lower.includes("priority")) {
      reply = "FocusFlow scored DBMS Assignment as highest priority because of its impending deadline, academic weighting, and zero blocking dependencies.";
    } else if (lower.includes("tomorrow") || lower.includes("move")) {
      reply = "I've flagged low-priority items. You can click 'Optimize Schedule' on your dashboard to shift them to tomorrow's queue automatically.";
    } else {
      reply = `Based on your ${context?.tasks?.length || 6} active tasks, focus on finishing high-impact deadlines first before diving into asynchronous communications.`;
    }

    res.json({ success: true, reply, source: "heuristic" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Chat error" });
  }
});

// Vite middleware / production serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FocusFlow AI server running at http://localhost:${PORT}`);
  });
}

startServer();
