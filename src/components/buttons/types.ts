export interface BaseButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'gray' | 'outline';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  loading?: boolean;
}

export interface IconButtonProps extends Omit<BaseButtonProps, 'children'> {
  icon: React.ReactNode;
  title?: string;
  'aria-label'?: string;
}

export interface TabButtonProps extends BaseButtonProps {
  active?: boolean;
}

export interface FilterButtonProps extends BaseButtonProps {
  active?: boolean;
}

export interface ActionButtonProps extends BaseButtonProps {
  tooltip?: string;
}