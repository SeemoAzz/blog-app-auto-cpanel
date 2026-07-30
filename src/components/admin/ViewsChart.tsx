import type { DayBucket } from "@/lib/stats";

// Petit graphique en barres (7 jours), sans dependance externe.
export function ViewsChart({ series }: { series: DayBucket[] }) {
  const max = Math.max(1, ...series.map((s) => s.count));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 10,
        height: 160,
        padding: "8px 0",
      }}
    >
      {series.map((s) => {
        const h = Math.round((s.count / max) * 120);
        return (
          <div
            key={s.date}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
            title={`${s.count} vue(s) le ${s.date}`}
          >
            <div style={{ fontSize: 12, color: "var(--admin-muted)", fontWeight: 600 }}>
              {s.count}
            </div>
            <div
              style={{
                width: "100%",
                maxWidth: 40,
                height: Math.max(4, h),
                background: "var(--admin-primary, #4f46e5)",
                borderRadius: 6,
                transition: "height .2s ease",
              }}
            />
            <div style={{ fontSize: 12, color: "var(--admin-muted)" }}>{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}
