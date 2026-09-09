import React, { useState, useMemo } from 'react';
import { Flame, Calendar, Award, Clock, Sparkles } from 'lucide-react';

export default function YearHeatmap({ learnerName }) {
  const [hoveredDay, setHoveredDay] = useState(null);

  // Generate 52 weeks x 7 days data leading up to today
  const { weeks, stats } = useMemo(() => {
    const today = new Date();
    const days = [];
    let totalHours = 0;
    let activeDaysCount = 0;

    // Seeded random-like distribution with recent active streak
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);

      // Higher activity on recent days and weekdays
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isRecent = i < 30;

      let level = 0;
      let hours = 0;
      let activities = [];

      // Create realistic learning frequency
      const rand = Math.sin(i * 0.3) * 0.5 + 0.5;
      if (isRecent && i < 8) {
        // Active streak!
        level = (i % 3) + 1;
        hours = level * 1.5;
        activities.push('Adaptive Roadmap module completed');
      } else if (!isWeekend && rand > 0.45) {
        level = rand > 0.8 ? 3 : rand > 0.65 ? 2 : 1;
        hours = Math.round(level * 1.4 * 10) / 10;
        activities.push(`${level} practice session${level > 1 ? 's' : ''}`);
        if (level >= 2) activities.push('Verification Quiz passed');
      } else if (isWeekend && rand > 0.7) {
        level = 1;
        hours = 1.0;
        activities.push('Weekend concept review');
      }

      if (level > 0) {
        totalHours += hours;
        activeDaysCount++;
      }

      days.push({
        date: d.toISOString().split('T')[0],
        formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        level,
        hours,
        activities
      });
    }

    // Group into 52 columns of 7 days
    const weekCols = [];
    for (let w = 0; w < 52; w++) {
      weekCols.push(days.slice(w * 7, (w + 1) * 7));
    }

    return {
      weeks: weekCols,
      stats: {
        totalHours: Math.round(totalHours),
        activeDays: activeDaysCount,
        currentStreak: 8,
        longestStreak: 21
      }
    };
  }, []);

  const getLevelColor = (level) => {
    switch (level) {
      case 3:
        return 'bg-blue-600 border-blue-700 shadow-2xs';
      case 2:
        return 'bg-blue-400 border-blue-500';
      case 1:
        return 'bg-blue-200 border-blue-300';
      default:
        return 'bg-slate-100 border-slate-200';
    }
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">

      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <Calendar className="w-4 h-4" />
            </span>
            <h3 className="font-extrabold text-slate-900 font-outfit text-sm">
              365-Day Learning Activity Heatmap
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Consistency matrix for <strong className="text-slate-800 font-semibold">{learnerName || 'Alex Rivera'}</strong>
          </p>
        </div>

        {/* 4 Stat Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 flex items-center space-x-1.5">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-400" />
            <div className="text-left">
              <div className="text-[9px] font-bold uppercase text-orange-600 leading-none">Streak</div>
              <div className="text-xs font-black text-orange-800">{stats.currentStreak} Days</div>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-blue-600" />
            <div className="text-left">
              <div className="text-[9px] font-bold uppercase text-blue-600 leading-none">Total Time</div>
              <div className="text-xs font-black text-blue-900">{stats.totalHours} Hours</div>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-emerald-600" />
            <div className="text-left">
              <div className="text-[9px] font-bold uppercase text-emerald-600 leading-none">Active Days</div>
              <div className="text-xs font-black text-emerald-900">{stats.activeDays} Days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[680px]">

          {/* Months Row */}
          <div className="flex justify-between text-[10px] font-bold text-slate-400 pl-6 pr-2 mb-1">
            {months.map((m, idx) => (
              <span key={idx}>{m}</span>
            ))}
          </div>

          {/* Grid with Weekday Labels */}
          <div className="flex items-start space-x-1">

            {/* Weekdays Labels */}
            <div className="flex flex-col space-y-1.5 text-[9px] font-bold text-slate-400 pr-1 pt-0.5">
              <span>Mon</span>
              <span className="opacity-0">Tue</span>
              <span>Wed</span>
              <span className="opacity-0">Thu</span>
              <span>Fri</span>
              <span className="opacity-0">Sat</span>
              <span className="opacity-0">Sun</span>
            </div>

            {/* 52 Columns */}
            <div className="flex space-x-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col space-y-1">
                  {week.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-2.5 h-2.5 rounded-[2px] border transition-all duration-150 cursor-pointer ${getLevelColor(
                        day.level
                      )} hover:ring-2 hover:ring-blue-500 hover:scale-125`}
                    />
                  ))}
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* Footer Legend & Tooltip readout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">

        {/* Dynamic Tooltip Info */}
        <div className="text-slate-600 font-medium text-xs min-h-[20px] flex items-center space-x-1.5">
          {hoveredDay ? (
            <span className="text-blue-900 font-semibold animate-fadeIn">
              <strong>{hoveredDay.formattedDate}</strong>: {hoveredDay.hours > 0 ? `${hoveredDay.hours} hours logged (${hoveredDay.activities.join(', ')})` : 'No study activity'}
            </span>
          ) : (
            <span className="text-slate-400 text-[11px]">Hover over any square to inspect daily study history</span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-medium">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-100 border border-slate-200"></div>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-blue-200 border border-blue-300"></div>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-blue-400 border border-blue-500"></div>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-blue-600 border border-blue-700"></div>
          <span>More</span>
        </div>

      </div>

    </div>
  );
}
