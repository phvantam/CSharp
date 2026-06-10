export function Loading({ fullScreen = false }: { fullScreen?: boolean }) {
  const inner = (
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-[#1db954] border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-[#6b6b6b]">Đang tải...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center z-50">
        {inner}
      </div>
    );
  }
  return <div className="flex items-center justify-center py-16">{inner}</div>;
}