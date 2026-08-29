/**
 * Utility to generate and download .ics iCalendar files for scheduled study focus blocks
 */

export function generateAndDownloadICS({ roleTitle, weeklyHours, roadmapSteps }) {
  const now = new Date();
  const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // starts tomorrow

  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PathCraft AI//Employee Learning Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:PathCraft AI Study Schedule'
  ];

  const steps = roadmapSteps || [];
  const hoursPerWeek = weeklyHours || 6;
  const sessionsPerWeek = Math.min(3, Math.max(2, Math.round(hoursPerWeek / 2)));
  const minutesPerSession = Math.round((hoursPerWeek * 60) / sessionsPerWeek);

  steps.slice(0, 6).forEach((step, idx) => {
    const eventDate = new Date(startDate.getTime() + idx * 3 * 24 * 60 * 60 * 1000);
    eventDate.setHours(18, 0, 0, 0); // 6:00 PM study block
    const endDate = new Date(eventDate.getTime() + minutesPerSession * 60 * 1000);

    const uid = `pathcraft-${step.step_number || idx}-${Date.now()}@pathcraft.ai`;
    const title = `📚 PathCraft AI Study: ${step.course?.title || step.skill_name || 'Upskilling Session'}`;
    const description = `Upskilling focus block for ${roleTitle}\\nSkill Target: ${step.skill_name}\\nResource: ${step.course?.source_url || 'PathCraft AI Portal'}\\nGoal: ${step.ai_explanation || 'Progress on adaptive learning roadmap'}`;

    icsContent.push('BEGIN:VEVENT');
    icsContent.push(`UID:${uid}`);
    icsContent.push(`DTSTAMP:${formatDate(new Date())}`);
    icsContent.push(`DTSTART:${formatDate(eventDate)}`);
    icsContent.push(`DTEND:${formatDate(endDate)}`);
    icsContent.push(`SUMMARY:${title}`);
    icsContent.push(`DESCRIPTION:${description}`);
    icsContent.push('STATUS:CONFIRMED');
    icsContent.push('BEGIN:VALARM');
    icsContent.push('TRIGGER:-PT15M');
    icsContent.push('ACTION:DISPLAY');
    icsContent.push('DESCRIPTION:Reminder: Your PathCraft AI Study Session starts in 15 minutes');
    icsContent.push('END:VALARM');
    icsContent.push('END:VEVENT');
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `PathCraft-Study-Schedule-${roleTitle.replace(/\s+/g, '-')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
