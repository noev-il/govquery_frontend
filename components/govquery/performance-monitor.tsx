"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, Database, Zap } from "lucide-react";

interface PerformanceMetrics {
  backendResponseTime: number;
  cacheHitRate: number;
  totalRequests: number;
  errorRate: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    backendResponseTime: 0,
    cacheHitRate: 0,
    totalRequests: 0,
    errorRate: 0,
  });

  useEffect(() => {
    // Simulate performance monitoring
    const interval = setInterval(() => {
      setMetrics(prev => ({
        backendResponseTime: Math.random() * 2000 + 500, // 500-2500ms
        cacheHitRate: Math.random() * 0.4 + 0.6, // 60-100%
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 3),
        errorRate: Math.random() * 0.05, // 0-5%
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getPerformanceColor = (value: number, type: 'time' | 'rate') => {
    if (type === 'time') {
      if (value < 1000) return 'text-green-600';
      if (value < 2000) return 'text-yellow-600';
      return 'text-red-600';
    } else {
      if (value > 0.9) return 'text-green-600';
      if (value > 0.7) return 'text-yellow-600';
      return 'text-red-600';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4" />
          Performance Metrics
        </CardTitle>
        <CardDescription>
          Real-time performance monitoring
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Response Time</span>
              <Badge variant="outline" className={getPerformanceColor(metrics.backendResponseTime, 'time')}>
                <Clock className="h-3 w-3 mr-1" />
                {Math.round(metrics.backendResponseTime)}ms
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cache Hit Rate</span>
              <Badge variant="outline" className={getPerformanceColor(metrics.cacheHitRate, 'rate')}>
                <Database className="h-3 w-3 mr-1" />
                {Math.round(metrics.cacheHitRate * 100)}%
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Requests</span>
              <Badge variant="outline">
                <Zap className="h-3 w-3 mr-1" />
                {metrics.totalRequests}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Error Rate</span>
              <Badge variant="outline" className={getPerformanceColor(1 - metrics.errorRate, 'rate')}>
                <Activity className="h-3 w-3 mr-1" />
                {Math.round(metrics.errorRate * 100)}%
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
