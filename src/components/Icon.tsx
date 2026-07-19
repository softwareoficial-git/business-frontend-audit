'use client';

import { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  name: string;
}

export default function Icon({ name, ...props }: IconProps) {
  return (
    <svg
      {...props}
      dangerouslySetInnerHTML={{
        __html: `<use href="/assets/icons/${name}.svg#root" />`,
      }}
    />
  );
}
