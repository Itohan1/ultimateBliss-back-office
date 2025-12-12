type BreadcrumbsProps = {
  items: { label: string; onClick?: () => void }[];
};

export function Breadcrumb({ items }: BreadcrumbsProps) {
  return (
    <div className="text-sm text-gray-500 mb-8 flex items-center gap-1">
      {items.map((item, idx) => (
        <span key={idx}>
          {item.onClick ? (
            <span
              className="cursor-pointer text-pink-600 hover:underline"
              onClick={item.onClick}
            >
              {item.label}
            </span>
          ) : (
            <span>{item.label}</span>
          )}
          {idx < items.length - 1 && " / "}
        </span>
      ))}
    </div>
  );
}
