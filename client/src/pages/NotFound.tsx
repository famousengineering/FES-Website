/** Shown for unknown URLs (the host also answers them with a real HTTP 404). Styled with the site's own classes. */
export default function NotFound() {
  return (
    <section className="notfound" aria-labelledby="notfound-title">
      <p className="notfound-code">404</p>
      <h1 id="notfound-title">This page could not be found.</h1>
      <p>The link may be old or mistyped. Here are some places to go instead.</p>
      <div className="notfound-actions">
        <a className="button button-amber" href="/">Go to the home page</a>
        <a className="button button-ghost" href="/services">Our services</a>
        <a className="button button-ghost" href="/contact">Contact us</a>
      </div>
    </section>
  );
}
