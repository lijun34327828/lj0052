import { useState, useEffect } from 'react'
import {
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, ResponsiveContainer,
} from 'recharts'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'

const PIE_COLORS = ['#00F0FF', '#6B2FA0', '#FF8C00', '#FF2D55', '#00FF88', '#FFD700']

const GRID_COLOR = 'rgba(255,255,255,0.05)'
const AXIS_COLOR = '#666'

const customTooltipStyle = {
  backgroundColor: 'rgba(20,20,30,0.95)',
  border: '1px solid rgba(0,240,255,0.3)',
  borderRadius: '8px',
  boxShadow: '0 0 10px rgba(0,240,255,0.1)',
}

export default function Statistics() {
  const { themeStats, trendData, npcWorkload, fetchThemeStats, fetchTrendData, fetchNpcWorkload } = useStore()
  const [trendDays, setTrendDays] = useState(7)

  useEffect(() => {
    fetchThemeStats()
    fetchTrendData(trendDays)
    fetchNpcWorkload()
  }, [fetchThemeStats, fetchTrendData, fetchNpcWorkload, trendDays])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="glass-panel p-5">
          <h3 className="text-sm font-medium text-neon-cyan mb-4">主题热度分布</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={themeStats}
                  dataKey="booking_count"
                  nameKey="theme_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  paddingAngle={2}
                  label={({ theme_name, percentage }) => `${theme_name} ${percentage}%`}
                >
                  {themeStats.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} itemStyle={{ color: '#e0e0e0' }} />
                <Legend wrapperStyle={{ color: '#999', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {themeStats.length === 0 && <EmptyChart />}
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-neon-cyan">预约趋势</h3>
            <div className="flex gap-1">
              {[7, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setTrendDays(d)}
                  className={cn(
                    'px-3 py-1 rounded text-xs border transition-all',
                    trendDays === d
                      ? 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10'
                      : 'border-white/10 text-gray-400 hover:text-gray-200'
                  )}
                >
                  {d}天
                </button>
              ))}
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis dataKey="date" stroke={AXIS_COLOR} tick={{ fontSize: 11 }} />
                <YAxis stroke={AXIS_COLOR} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={customTooltipStyle} itemStyle={{ color: '#e0e0e0' }} />
                <Legend wrapperStyle={{ color: '#999', fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="预约数"
                  stroke="#00F0FF"
                  strokeWidth={2}
                  dot={{ fill: '#00F0FF', r: 3 }}
                  activeDot={{ r: 5, fill: '#00F0FF' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {trendData.length === 0 && <EmptyChart />}
        </div>
      </div>

      <div className="glass-panel p-5">
        <h3 className="text-sm font-medium text-neon-cyan mb-4">NPC 工作量</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={npcWorkload}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey="npc_name" stroke={AXIS_COLOR} tick={{ fontSize: 11 }} />
              <YAxis stroke={AXIS_COLOR} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={customTooltipStyle} itemStyle={{ color: '#e0e0e0' }} />
              <Legend wrapperStyle={{ color: '#999', fontSize: 12 }} />
              <Bar dataKey="session_count" name="场次数" radius={[4, 4, 0, 0]}>
                {npcWorkload.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {npcWorkload.length === 0 && <EmptyChart />}
      </div>
    </div>
  )
}

function EmptyChart() {
  return <div className="text-center text-gray-600 text-sm -mt-4">暂无数据</div>
}
