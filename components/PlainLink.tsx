// Plain <a> instead of next/link: every navigation is a full page load that returns HTML.
// (next/link fetches RSC payloads, text/x-component, in the background.)
type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; prefetch?: boolean };
export default function Link({ prefetch: _prefetch, ...rest }: Props) {
  return <a {...rest} />;
}
