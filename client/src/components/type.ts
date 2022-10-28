import React from 'react';

export type ISize = 'lg' | 'md' | 'sm' | 'xs';

export type Itype = 'primary' | 'secondary' | 'accent';

export interface CommonProps {
  className?: string;
  style?: React.CSSProperties;
}
