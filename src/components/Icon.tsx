'use client';

// Ahora cargamos el SVG inline para permitir que CSS (fill: currentColor) funcione
// Esto permite que el color cambie con el tema.
// Nota: Requiere que los SVGs en public/assets/icons/ tengan fill="currentColor"
interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
}

export default function Icon({ name, style, ...props }: IconProps) {
  return (
    <div
      style={{
        display: 'inline-block',
        width: style?.width || '24px',
        height: style?.height || '24px',
        backgroundColor: style?.color || 'currentColor',
        WebkitMaskImage: `url(/assets/icons/${name}.svg)`,
        maskImage: `url(/assets/icons/${name}.svg)`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        ...style,
      }}
      {...props}
    />
  );
}
