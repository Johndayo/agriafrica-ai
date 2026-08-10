interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

const roundedMap = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

export function Skeleton({ width, height, className = "", rounded = "md" }: SkeletonProps) {
  return (
    <div
      className={`skeleton-pulse ${roundedMap[rounded]} ${className}`}
      style={{ width, height, minHeight: height ?? "1rem" }}
      aria-hidden="true"
    />
  );
}

// ---------------------------------------------------------------------------
// Pre-built skeleton layouts — absolute dimensions prevent CLS
// ---------------------------------------------------------------------------

export function CardSkeleton() {
  return (
    <div className="skeleton-card" aria-label="Loading">
      <Skeleton width="100%" height={180} rounded="lg" />
      <div style={{ padding: "12px 0", display: "flex", flexDirection: "column", gap: 8 }}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="100%" height={12} />
        <Skeleton width="40%" height={12} />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="skeleton-list" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-list-row">
          <Skeleton width={44} height={44} rounded="full" />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <Skeleton width="60%" height={14} />
            <Skeleton width="85%" height={10} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="skeleton-dashboard" aria-label="Loading dashboard">
      {/* Header skeleton */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        <Skeleton width="45%" height={24} />
        <Skeleton width="65%" height={14} />
      </div>
      {/* Weather card skeleton */}
      <Skeleton width="100%" height={100} rounded="lg" />
      {/* Quick actions skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
        <Skeleton width="100%" height={64} rounded="lg" />
        <Skeleton width="100%" height={64} rounded="lg" />
        <Skeleton width="100%" height={64} rounded="lg" />
        <Skeleton width="100%" height={64} rounded="lg" />
      </div>
      {/* Articles skeleton */}
      <div style={{ marginTop: 20 }}>
        <Skeleton width="40%" height={18} />
        <ListSkeleton count={3} />
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="skeleton-chat" aria-label="Loading conversation">
      <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "16px 0" }}>
        {[80, 120, 60, 100].map((w, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: i % 2 === 0 ? "flex-start" : "flex-end",
            }}
          >
            <Skeleton width={w} height={36} rounded="lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
