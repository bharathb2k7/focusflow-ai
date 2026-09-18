import { jsPDF } from 'jspdf';
import { Task, TimelineSlot } from '../types';

/**
 * Escapes fields for standard RFC 4180 CSV
 */
function escapeCSV(field: unknown): string {
  if (field === null || field === undefined) {
    return '""';
  }
  const str = String(field);
  // If contains commas, newlines, or double quotes, quote it and double the quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Triggers browser download of a blob
 */
export function downloadFile(content: string | Blob, filename: string, mimeType: string): void {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 150);
}

/**
 * Generates and downloads Tasks as CSV
 */
export function exportTasksToCSV(tasks: Task[], customFilename?: string): void {
  const headers = [
    'Task ID',
    'Title',
    'Priority',
    'Status',
    'Category',
    'Estimated Minutes',
    'Deadline',
    'Tags',
    'Dependencies',
    'Description',
    'AI Rationale',
    'Created At',
  ];

  const rows = tasks.map((t) => [
    t.id,
    t.title,
    t.priority.toUpperCase(),
    t.status.replace('_', ' ').toUpperCase(),
    t.category,
    t.estimated_minutes,
    t.deadline || 'None',
    (t.tags || []).join('; '),
    (t.dependencies || []).join('; '),
    t.description || '',
    t.ai_rationale || '',
    t.created_at || '',
  ]);

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\r\n');

  const todayStr = new Date().toISOString().split('T')[0];
  const filename = customFilename || `FocusFlow_Tasks_${todayStr}.csv`;
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Generates and downloads Daily Plan (Timeline Slots) as CSV
 */
export function exportDailyPlanToCSV(
  slots: TimelineSlot[],
  options?: { date?: string; goal?: string; customFilename?: string }
): void {
  const headers = [
    'Slot ID',
    'Start Time',
    'End Time',
    'Duration (Min)',
    'Slot Type',
    'Activity / Title',
    'Completed',
    'Status',
    'Associated Task ID',
    'Reason / Notes',
  ];

  const rows = slots.map((s) => [
    s.id,
    s.startTime,
    s.endTime,
    s.durationMinutes,
    s.type.toUpperCase(),
    s.title,
    s.completed ? 'YES' : 'NO',
    (s.status || 'normal').toUpperCase(),
    s.taskId || 'None',
    s.reason || '',
  ]);

  let csvContent = '';
  if (options?.goal) {
    csvContent += `# Target Goal: ${options.goal}\r\n`;
  }
  if (options?.date) {
    csvContent += `# Plan Date: ${options.date}\r\n`;
  }
  csvContent += [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\r\n');

  const todayStr = options?.date || new Date().toISOString().split('T')[0];
  const filename = options?.customFilename || `FocusFlow_Daily_Plan_${todayStr}.csv`;
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Generates and downloads Tasks as a clean, professionally formatted PDF
 */
export function exportTasksToPDF(
  tasks: Task[],
  options?: {
    userName?: string;
    filterLabel?: string;
    customFilename?: string;
  }
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  let currentY = 18;

  // Header Background Accent
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(margin, currentY, contentWidth, 22, 'F');

  // Brand Name & Document Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('FocusFlow AI  |  Task & Workload Report', margin + 6, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // slate-300
  const dateStr = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.text(`Generated: ${dateStr}  |  Owner: ${options?.userName || 'Alex Vance'}`, margin + 6, currentY + 16);

  currentY += 28;

  // Summary Metrics Banner
  const totalTasks = tasks.length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const highUrgentCount = tasks.filter((t) => t.priority === 'high' || t.priority === 'urgent').length;
  const totalMinutes = tasks.reduce((sum, t) => sum + (t.estimated_minutes || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, currentY, contentWidth, 16, 2, 2, 'FD');

  const metricColWidth = contentWidth / 4;
  const metrics = [
    { label: 'TOTAL TASKS', val: `${totalTasks}` },
    { label: 'COMPLETED', val: `${completedCount} (${totalTasks ? Math.round((completedCount / totalTasks) * 100) : 0}%)` },
    { label: 'HIGH / URGENT', val: `${highUrgentCount}` },
    { label: 'TOTAL EST. TIME', val: `${totalHours} hrs` },
  ];

  metrics.forEach((m, idx) => {
    const x = margin + idx * metricColWidth + 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(m.label, x, currentY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(m.val, x, currentY + 12);
  });

  currentY += 22;

  // Filter Indicator
  if (options?.filterLabel) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Scope: ${options.filterLabel}`, margin, currentY);
    currentY += 5;
  }

  // Table Column Headers
  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.rect(margin, currentY, contentWidth, 8, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85); // slate-700

  // Column X positions
  const colX = {
    priority: margin + 2,
    status: margin + 18,
    title: margin + 38,
    category: margin + 112,
    time: margin + 140,
    deadline: margin + 158,
  };

  doc.text('PRIORITY', colX.priority, currentY + 5.5);
  doc.text('STATUS', colX.status, currentY + 5.5);
  doc.text('TASK TITLE & DETAILS', colX.title, currentY + 5.5);
  doc.text('CATEGORY', colX.category, currentY + 5.5);
  doc.text('EST. TIME', colX.time, currentY + 5.5);
  doc.text('DEADLINE', colX.deadline, currentY + 5.5);

  currentY += 8;

  // Render Table Rows
  tasks.forEach((task, index) => {
    // Check if new page needed
    if (currentY > pageHeight - 20) {
      doc.addPage();
      currentY = 18;

      // Repeat Table Headers on next page
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, currentY, contentWidth, 8, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      doc.text('PRIORITY', colX.priority, currentY + 5.5);
      doc.text('STATUS', colX.status, currentY + 5.5);
      doc.text('TASK TITLE & DETAILS', colX.title, currentY + 5.5);
      doc.text('CATEGORY', colX.category, currentY + 5.5);
      doc.text('EST. TIME', colX.time, currentY + 5.5);
      doc.text('DEADLINE', colX.deadline, currentY + 5.5);
      currentY += 8;
    }

    const isEven = index % 2 === 0;
    const rowHeight = task.description ? 13 : 9.5;

    if (isEven) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.setDrawColor(241, 245, 249);
    doc.rect(margin, currentY, contentWidth, rowHeight, 'FD');

    // Priority badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    if (task.priority === 'urgent') {
      doc.setTextColor(225, 29, 72); // rose-600
    } else if (task.priority === 'high') {
      doc.setTextColor(234, 88, 12); // orange-600
    } else if (task.priority === 'medium') {
      doc.setTextColor(79, 70, 229); // indigo-600
    } else {
      doc.setTextColor(100, 116, 139); // slate-500
    }
    doc.text(task.priority.toUpperCase(), colX.priority, currentY + 5.5);

    // Status
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    if (task.status === 'completed') {
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.text('Done', colX.status, currentY + 5.5);
    } else if (task.status === 'in_progress') {
      doc.setTextColor(59, 130, 246); // blue-500
      doc.text('In Progress', colX.status, currentY + 5.5);
    } else if (task.status === 'blocked') {
      doc.setTextColor(239, 68, 68); // red-500
      doc.text('Blocked', colX.status, currentY + 5.5);
    } else {
      doc.setTextColor(100, 116, 139);
      doc.text('To-Do', colX.status, currentY + 5.5);
    }

    // Title (truncate if needed)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    const safeTitle = doc.splitTextToSize(task.title, 70)[0] || task.title;
    doc.text(safeTitle, colX.title, currentY + 5.5);

    // Description snippet if available
    if (task.description) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      const safeDesc = doc.splitTextToSize(task.description, 70)[0] || '';
      doc.text(safeDesc, colX.title, currentY + 9.5);
    }

    // Category
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(task.category || 'General', colX.category, currentY + 5.5);

    // Estimated minutes
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(`${task.estimated_minutes} min`, colX.time, currentY + 5.5);

    // Deadline
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(task.deadline || '-', colX.deadline, currentY + 5.5);

    currentY += rowHeight;
  });

  // Footer on each page
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `FocusFlow AI - Executive Task Report - Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const filename = options?.customFilename || `FocusFlow_Tasks_${todayStr}.pdf`;
  doc.save(filename);
}

/**
 * Generates and downloads Daily Plan as a clean, professionally formatted PDF
 */
export function exportDailyPlanToPDF(
  slots: TimelineSlot[],
  options?: {
    userName?: string;
    date?: string;
    goal?: string;
    energyLevel?: string;
    customFilename?: string;
  }
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  let currentY = 18;

  // Header Banner
  doc.setFillColor(79, 70, 229); // Indigo-600
  doc.rect(margin, currentY, contentWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('FocusFlow AI  |  Daily Execution & Time-Block Plan', margin + 6, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(224, 231, 255); // Indigo-100
  const dateFormatted = options?.date || new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  doc.text(
    `Date: ${dateFormatted}  |  User: ${options?.userName || 'Alex Vance'}${options?.energyLevel ? `  |  Energy: ${options.energyLevel.toUpperCase()}` : ''}`,
    margin + 6,
    currentY + 17
  );

  currentY += 30;

  // Objective / Goal Box if present
  if (options?.goal) {
    doc.setFillColor(238, 242, 255); // Indigo-50
    doc.setDrawColor(199, 210, 254); // Indigo-200
    doc.roundedRect(margin, currentY, contentWidth, 12, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(67, 56, 202); // Indigo-700
    doc.text('PRIMARY OBJECTIVE:', margin + 4, currentY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 27, 75); // Indigo-950
    const goalText = doc.splitTextToSize(options.goal, contentWidth - 45)[0] || options.goal;
    doc.text(goalText, margin + 42, currentY + 5);

    currentY += 16;
  }

  // Plan Metrics Summary
  const focusSlots = slots.filter((s) => s.type === 'task');
  const breakSlots = slots.filter((s) => s.type === 'break' || s.type === 'buffer');
  const totalFocusMin = focusSlots.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalBreakMin = breakSlots.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalScheduleMin = totalFocusMin + totalBreakMin;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, 'FD');

  const metricColWidth = contentWidth / 4;
  const planMetrics = [
    { label: 'SCHEDULED SLOTS', val: `${slots.length} total blocks` },
    { label: 'DEEP WORK FOCUS', val: `${(totalFocusMin / 60).toFixed(1)} hrs (${totalFocusMin}m)` },
    { label: 'REST & BUFFER', val: `${totalBreakMin} mins` },
    { label: 'TIME SPAN', val: `${slots[0]?.startTime || '--'} to ${slots[slots.length - 1]?.endTime || '--'}` },
  ];

  planMetrics.forEach((m, idx) => {
    const x = margin + idx * metricColWidth + 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, x, currentY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(m.val, x, currentY + 10.5);
  });

  currentY += 19;

  // Table Column Headers
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, currentY, contentWidth, 8, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  const colX = {
    time: margin + 3,
    type: margin + 32,
    title: margin + 60,
    duration: margin + 140,
    status: margin + 160,
  };

  doc.text('TIME WINDOW', colX.time, currentY + 5.5);
  doc.text('BLOCK TYPE', colX.type, currentY + 5.5);
  doc.text('ACTIVITY / FOCUS TARGET', colX.title, currentY + 5.5);
  doc.text('DURATION', colX.duration, currentY + 5.5);
  doc.text('STATE', colX.status, currentY + 5.5);

  currentY += 8;

  // Render Slots
  slots.forEach((slot, index) => {
    if (currentY > pageHeight - 22) {
      doc.addPage();
      currentY = 18;

      doc.setFillColor(241, 245, 249);
      doc.rect(margin, currentY, contentWidth, 8, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      doc.text('TIME WINDOW', colX.time, currentY + 5.5);
      doc.text('BLOCK TYPE', colX.type, currentY + 5.5);
      doc.text('ACTIVITY / FOCUS TARGET', colX.title, currentY + 5.5);
      doc.text('DURATION', colX.duration, currentY + 5.5);
      doc.text('STATE', colX.status, currentY + 5.5);
      currentY += 8;
    }

    const isBreak = slot.type === 'break' || slot.type === 'buffer';
    const isDisruption = slot.type === 'disruption';
    const rowHeight = slot.reason ? 12 : 9;

    if (isDisruption) {
      doc.setFillColor(254, 243, 199); // amber-100
    } else if (isBreak) {
      doc.setFillColor(240, 253, 244); // emerald-50
    } else if (index % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }

    doc.setDrawColor(241, 245, 249);
    doc.rect(margin, currentY, contentWidth, rowHeight, 'FD');

    // Time Window
    doc.setFont('courier', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${slot.startTime} - ${slot.endTime}`, colX.time, currentY + 5.5);

    // Block Type
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    if (isDisruption) {
      doc.setTextColor(180, 83, 9); // amber-700
      doc.text('DISRUPTION', colX.type, currentY + 5.5);
    } else if (isBreak) {
      doc.setTextColor(5, 150, 105); // emerald-600
      doc.text(slot.type === 'buffer' ? 'BUFFER REST' : 'BREAK', colX.type, currentY + 5.5);
    } else {
      doc.setTextColor(79, 70, 229); // indigo-600
      doc.text('DEEP WORK', colX.type, currentY + 5.5);
    }

    // Title
    doc.setFont('helvetica', isBreak ? 'normal' : 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    const safeTitle = doc.splitTextToSize(slot.title, 75)[0] || slot.title;
    doc.text(safeTitle, colX.title, currentY + 5.5);

    // Reason / Note if exists
    if (slot.reason) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      const safeReason = doc.splitTextToSize(slot.reason, 75)[0] || '';
      doc.text(safeReason, colX.title, currentY + 9.5);
    }

    // Duration
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(`${slot.durationMinutes} min`, colX.duration, currentY + 5.5);

    // State / Status
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    if (slot.completed) {
      doc.setTextColor(16, 185, 129);
      doc.text('COMPLETED', colX.status, currentY + 5.5);
    } else if (slot.status === 'delayed' || slot.status === 'rescheduled') {
      doc.setTextColor(217, 119, 6);
      doc.text('RESCHEDULED', colX.status, currentY + 5.5);
    } else if (slot.isCurrent) {
      doc.setTextColor(79, 70, 229);
      doc.text('ACTIVE NOW', colX.status, currentY + 5.5);
    } else {
      doc.setTextColor(100, 116, 139);
      doc.text('SCHEDULED', colX.status, currentY + 5.5);
    }

    currentY += rowHeight;
  });

  // Footer on all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `FocusFlow AI - Daily Plan Offline Schedule - Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const filename = options?.customFilename || `FocusFlow_Daily_Plan_${todayStr}.pdf`;
  doc.save(filename);
}
