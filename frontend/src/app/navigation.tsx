import type { AnchorHTMLAttributes, MouseEvent } from 'react';

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
};

export function navigate(to: string) {
  window.history.pushState({}, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function useNavigate() {
  return navigate;
}

export function Link({ to, onClick, ...props }: LinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    event.preventDefault();
    navigate(to);
  };

  return <a href={to} onClick={handleClick} {...props} />;
}
