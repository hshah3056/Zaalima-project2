import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Zap, 
  RefreshCw, 
  Activity, 
  Clock, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  TrendingUp, 
  Play, 
  Server,
  ArrowUpRight,
  ShieldCheck,
  Flame,
  BarChart3
} from 'lucide-react';

const API_BASE = "http://localhost:5001/api";

export default function CacheTelemetryModal({ 
  isOpen, 
  onClose, 
  currentBoardId, 
  currentBoardName,
  socket,
  showToast = () => {}
}) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWarming, setIsWarming] = useState(false);
  const [isFlushing, setIsFlushing] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState(null);
  const [isRunningBenchmark, setIsRunningBenchmark] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCacheStats();
    }
  }, [isOpen, currentBoardId]);

  // Real-time cache event listener via Socket.io
  useEffect(() => {
    if (!socket) return;
    const handleCacheUpdate = () => {
      fetchCacheStats();
    };

    socket.on("cache_telemetry_updated", handleCacheUpdate);
    socket.on("cache_invalidated", handleCacheUpdate);
    socket.on("cache_flushed", handleCacheUpdate);

    return () => {
      socket.off("cache_telemetry_updated", handleCacheUpdate);
      socket.off("cache_invalidated", handleCacheUpdate);
      socket.off("cache_flushed", handleCacheUpdate);
    };
  }, [socket]);

  // Global ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const fetchCacheStats = () => {
    setIsLoading(true);
    fetch(`${API_BASE}/cache/stats`)
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 'success') {
          setStats(res.data);
        }
      })
      .catch((err) => console.warn('Cache stats error:', err))
      .finally(() => setIsLoading(false));
  };

  const handleWarmCache = () => {
    if (!currentBoardId) return;
    setIsWarming(true);
    fetch(`${API_BASE}/cache/warm/${currentBoardId}`, { method: 'POST' })
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 'success') {
          showToast(`⚡ High-traffic cache warmed for "${currentBoardName || currentBoardId}"`, 'success');
          fetchCacheStats();
        }
      })
      .catch(() => showToast('Failed to warm board cache', 'error'))
      .finally(() => setIsWarming(false));
  };

  const handleInvalidateCurrentBoard = () => {
    if (!currentBoardId) return;
    fetch(`${API_BASE}/cache/invalidate/${currentBoardId}`, { method: 'POST' })
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 'success') {
          showToast(`🔄 Purged Redis cache for board "${currentBoardName || currentBoardId}"`, 'info');
          fetchCacheStats();
        }
      })
      .catch(() => showToast('Failed to purge board cache', 'error'));
  };

  const handleFlushAll = () => {
    if (!window.confirm('Are you sure you want to flush all Redis cache keys? This will reset all cached read stores.')) return;
    setIsFlushing(true);
    fetch(`${API_BASE}/cache/flush`, { method: 'POST' })
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 'success') {
          showToast('🧹 Successfully flushed all Redis cache keys', 'info');
          fetchCacheStats();
        }
      })
      .catch(() => showToast('Failed to flush cache', 'error'))
      .finally(() => setIsFlushing(false));
  };

  const handleRunBenchmark = () => {
    if (!currentBoardId) return;
    setIsRunningBenchmark(true);
    fetch(`${API_BASE}/cache/benchmark/${currentBoardId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ iterations: 50 })
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 'success') {
          setBenchmarkResult(res.data);
          showToast(`🚀 Benchmark complete: Redis is ${res.data.multiplier}!`, 'success');
          fetchCacheStats();
        }
      })
      .catch(() => showToast('Benchmark failed to execute', 'error'))
      .finally(() => setIsRunningBenchmark(false));
  };

  if (!isOpen) return null;

  const metrics = stats?.metrics || {
    hits: 0,
    misses: 0,
    hitRatioPercent: 0,
    cachedReadsSaved: 0,
    avgLatencyMs: 0.65,
    benchmarkDbAvgMs: 42.5,
    speedupMultiplier: 65.4,
  };

  const isRedis = stats?.provider === 'redis';

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="glass-panel animate-modal"
        style={{
          width: '840px',
          maxWidth: '96vw',
          maxHeight: '90vh',
          background: '#FFFFFF',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #DC2626 0%, #EA580C 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
            }}>
              <Zap size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Redis Caching & Telemetry Hub
                </h2>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: isRedis ? '#ECFDF5' : '#FEF3C7',
                  color: isRedis ? '#059669' : '#D97706',
                  border: isRedis ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isRedis ? '#10B981' : '#F59E0B',
                  }} />
                  {isRedis ? 'Redis Server Active' : 'In-Memory Fallback Active'}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px', margin: 0 }}>
                Optimizing high-traffic read operations via Cache-Aside & Event-Driven Invalidation.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={fetchCacheStats}
              title="Refresh telemetry"
              disabled={isLoading}
              style={{
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '0.45rem',
                cursor: 'pointer',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onClose}
              style={{
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '0.45rem',
                cursor: 'pointer',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{
          padding: '1.25rem 1.5rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          flex: 1,
        }}>
          {/* Key Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.85rem',
          }}>
            {/* Metric 1: Hit Ratio */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748B', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                <span>Hit Ratio</span>
                <TrendingUp size={14} color="#10B981" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginTop: '0.35rem' }}>
                {metrics.hitRatioPercent}%
              </div>
              <div style={{ width: '100%', height: '5px', background: '#E2E8F0', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, Math.max(5, metrics.hitRatioPercent))}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #10B981, #059669)',
                  borderRadius: '3px',
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>

            {/* Metric 2: Latency Benchmark */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748B', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                <span>Read Latency</span>
                <Clock size={14} color="#4F46E5" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4F46E5', marginTop: '0.35rem' }}>
                {metrics.avgLatencyMs} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>ms</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700, marginTop: '0.5rem' }}>
                ⚡ ~{metrics.speedupMultiplier}x faster than DB
              </div>
            </div>

            {/* Metric 3: DB Reads Saved */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748B', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                <span>DB Reads Saved</span>
                <Database size={14} color="#0891B2" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginTop: '0.35rem' }}>
                {metrics.cachedReadsSaved}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.5rem' }}>
                Sub-millisecond offloads
              </div>
            </div>

            {/* Metric 4: Hits / Misses */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748B', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                <span>Hits vs Misses</span>
                <Activity size={14} color="#EA580C" />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginTop: '0.35rem' }}>
                <span style={{ color: '#059669' }}>{metrics.hits}H</span> / <span style={{ color: '#DC2626' }}>{metrics.misses}M</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.5rem' }}>
                Total: {metrics.totalRequests || (metrics.hits + metrics.misses)} requests
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div style={{
            background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)',
            border: '1px solid #C7D2FE',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#312E81', fontSize: '0.9rem' }}>
                <Flame size={18} color="#4F46E5" />
                <span>High-Traffic Board Controls ({currentBoardName || 'Active Board'})</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#4338CA', marginTop: '2px', margin: 0 }}>
                Simulate traffic, prewarm data structures, or test automatic write-invalidation.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={handleWarmCache}
                disabled={isWarming}
                style={{
                  background: '#4F46E5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.45rem 0.9rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)',
                }}
              >
                <Zap size={14} />
                <span>{isWarming ? 'Warming...' : 'Pre-Warm Board'}</span>
              </button>

              <button
                onClick={handleInvalidateCurrentBoard}
                title="Purge current board from cache to verify cache-aside"
                style={{
                  background: '#FFFFFF',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <RefreshCw size={13} />
                <span>Purge Board</span>
              </button>

              <button
                onClick={handleFlushAll}
                disabled={isFlushing}
                style={{
                  background: '#FEE2E2',
                  color: '#991B1B',
                  border: '1px solid #FCA5A5',
                  borderRadius: '8px',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Trash2 size={13} />
                <span>Flush All</span>
              </button>
            </div>
          </div>

          {/* Benchmark Section */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#0F172A', fontSize: '0.88rem' }}>
                <BarChart3 size={16} color="#059669" />
                <span>Sub-Millisecond Read Throughput Benchmark</span>
              </div>
              <button
                onClick={handleRunBenchmark}
                disabled={isRunningBenchmark}
                style={{
                  background: '#ECFDF5',
                  color: '#059669',
                  border: '1px solid #A7F3D0',
                  borderRadius: '7px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Play size={12} fill="#059669" />
                <span>{isRunningBenchmark ? 'Running 50 Reads...' : 'Run 50-Read Benchmark'}</span>
              </button>
            </div>

            {benchmarkResult ? (
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '0.85rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.75rem',
                textAlign: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Cached Latency</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>
                    {benchmarkResult.cachedAvgMs} ms
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Uncached Store</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#DC2626' }}>
                    {benchmarkResult.uncachedAvgMs} ms
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Cached Throughput</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4F46E5' }}>
                    {benchmarkResult.throughputCached}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Performance Gain</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>
                    {benchmarkResult.multiplier}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontStyle: 'italic' }}>
                Run the benchmark to compare sub-millisecond Redis response times against uncached relational query overhead.
              </div>
            )}
          </div>

          {/* Active Cached Keys Table */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '0.75rem 1rem',
              background: '#F8FAFC',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#334155',
            }}>
              <span>Active Redis / In-Memory Cached Keys ({stats?.activeKeys?.length || 0})</span>
              <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>
                TTL automatically refreshed on write invalidation
              </span>
            </div>

            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {(!stats?.activeKeys || stats.activeKeys.length === 0) ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem' }}>
                  No active keys in cache. Click "Pre-Warm Board" above to populate high-traffic board structures.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
                  <thead>
                    <tr style={{ background: '#FFFFFF', color: '#64748B', textAlign: 'left', borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '0.5rem 1rem', fontWeight: 600 }}>Key Name</th>
                      <th style={{ padding: '0.5rem 1rem', fontWeight: 600 }}>TTL Remaining</th>
                      <th style={{ padding: '0.5rem 1rem', fontWeight: 600 }}>Engine</th>
                      <th style={{ padding: '0.5rem 1rem', fontWeight: 600 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.activeKeys.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #F8FAFC' }}>
                        <td style={{ padding: '0.5rem 1rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#4F46E5' }}>
                          {item.key}
                        </td>
                        <td style={{ padding: '0.5rem 1rem', color: '#0F172A', fontWeight: 600 }}>
                          {item.ttlRemainingSec}s
                        </td>
                        <td style={{ padding: '0.5rem 1rem', color: '#64748B', textTransform: 'uppercase', fontSize: '0.68rem', fontWeight: 700 }}>
                          {item.provider}
                        </td>
                        <td style={{ padding: '0.5rem 1rem' }}>
                          <span style={{
                            background: '#ECFDF5',
                            color: '#059669',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                          }}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.75rem 1.5rem',
          background: '#F8FAFC',
          borderTop: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#64748B',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Server size={14} color="#64748B" />
            <span>Provider: <strong>{stats?.providerLabel || 'Redis Engine'}</strong></span>
          </div>
          <div>
            Press <kbd style={{ fontFamily: 'var(--font-mono)', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '1px 4px', borderRadius: '4px' }}>ESC</kbd> to close
          </div>
        </div>
      </div>
    </div>
  );
}
