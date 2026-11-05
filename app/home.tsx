export default function Home() {
  return (
    <main>
      <div className="announcement-bar">
        <span className="announcement-dot" aria-hidden="true" />
        A little more in sync, a lot more at home.
      </div>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Habico home">
          <span className="brand-mark" aria-hidden="true">h</span>
          <span>habico</span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#board">The board</a>
          <a href="#how-it-works">How it works</a>
          <a className="nav-cta" href="#board">Take a peek <span aria-hidden="true">↗</span></a>
        </nav>
      </header>

      <section className="hero section-wrap" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> THE HOUSEMATE HEADS-UP</p>
          <h1>Good homes run on <em>good timing.</em></h1>
          <p className="hero-description">
            The shared house board that gets chores out of your head and into
            everyone&apos;s week. Clear reminders, fewer awkward nudges.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#board">See the house board <span aria-hidden="true">↗</span></a>
            <a className="text-link" href="#how-it-works">How Habico works <span aria-hidden="true">↓</span></a>
          </div>
          <div className="house-note">
            <div className="avatar-stack" aria-hidden="true">
              <span className="avatar avatar-blue">M</span>
              <span className="avatar avatar-orange">J</span>
              <span className="avatar avatar-green">S</span>
            </div>
            <p><strong>Made for shared living.</strong><br />One house, one board, everyone in the loop.</p>
          </div>
        </div>

        <div className="hero-visual" aria-label="A bright, welcoming shared student home" role="img">
          <div className="photo-caption"><span className="caption-spark">✳</span> YOUR PLACE, A LITTLE MORE PEACEFUL</div>
          <div className="reminder-note">
            <div className="reminder-icon" aria-hidden="true">✓</div>
            <div>
              <span className="reminder-label">A friendly reminder</span>
              <strong>Kitchen reset is yours</strong>
              <span className="reminder-time">Today · before 8 pm</span>
            </div>
            <span className="reminder-arrow" aria-hidden="true">↗</span>
          </div>
          <div className="visual-index"><span>01</span> / 03</div>
        </div>
      </section>

      <section className="board-section" id="board">
        <div className="board-layout section-wrap">
          <div className="board-intro">
            <p className="eyebrow eyebrow-orange"><span /> THE HOUSE BOARD</p>
            <h2>Everyone knows<br />what&apos;s <em>happening.</em></h2>
            <p>One calm place for the little things that keep a shared home feeling like home.</p>
            <a className="text-link board-link" href="#how-it-works">A better kind of house chat <span aria-hidden="true">↗</span></a>
          </div>

          <div className="board-preview" aria-label="Example weekly house board">
            <div className="board-topline">
              <div>
                <span className="board-kicker">THIS WEEK AT</span>
                <h3>Maple House <span className="house-tag">4 housemates</span></h3>
              </div>
              <span className="week-label">WEEK 14 <span aria-hidden="true">⌄</span></span>
            </div>
            <div className="board-progress">
              <span className="progress-copy">HOUSE RESET <strong>2 of 4 done</strong></span>
              <span className="progress-track"><span /></span>
            </div>
            <div className="task-list">
              <div className="task-row task-done">
                <span className="task-check" aria-hidden="true">✓</span>
                <span className="task-name"><strong>Take out recycling</strong><small>Kitchen · Mon</small></span>
                <span className="task-person"><span className="mini-avatar mini-green">M</span> Mila</span>
                <span className="task-status status-done">DONE</span>
              </div>
              <div className="task-row task-done">
                <span className="task-check" aria-hidden="true">✓</span>
                <span className="task-name"><strong>Water the plants</strong><small>Living room · Tue</small></span>
                <span className="task-person"><span className="mini-avatar mini-lilac">J</span> Jonas</span>
                <span className="task-status status-done">DONE</span>
              </div>
              <div className="task-row task-current">
                <span className="task-check task-pending" aria-hidden="true" />
                <span className="task-name"><strong>Kitchen reset</strong><small>Kitchen · Today</small></span>
                <span className="task-person"><span className="mini-avatar mini-orange">Y</span> You</span>
                <span className="task-status status-today">TODAY</span>
              </div>
              <div className="task-row">
                <span className="task-check task-pending" aria-hidden="true" />
                <span className="task-name"><strong>Vacuum the hallway</strong><small>Hallway · Fri</small></span>
                <span className="task-person"><span className="mini-avatar mini-blue">S</span> Sam</span>
                <span className="task-status status-upcoming">FRI</span>
              </div>
            </div>
            <div className="board-footer"><span><i /> Everyone is up to date</span><span>SHARED HOUSE, SHARED LOAD</span></div>
          </div>
        </div>
      </section>

      <section className="how-section section-wrap" id="how-it-works">
        <div className="how-heading">
          <p className="eyebrow"><span /> A SMALL CHANGE OF PACE</p>
          <h2>Less chasing.<br /><em>More chilling.</em></h2>
        </div>
        <div className="steps-list">
          <article className="step-item">
            <span className="step-number">01</span>
            <div><h3>Make it your house</h3><p>Bring your housemates together on one shared board.</p></div>
            <span className="step-symbol step-symbol-blue" aria-hidden="true">⌂</span>
          </article>
          <article className="step-item">
            <span className="step-number">02</span>
            <div><h3>Share the small stuff</h3><p>Set a fair rota for chores, notes, and house updates.</p></div>
            <span className="step-symbol step-symbol-orange" aria-hidden="true">↗</span>
          </article>
          <article className="step-item">
            <span className="step-number">03</span>
            <div><h3>Get a gentle nudge</h3><p>Know what&apos;s yours and when, without the group-chat chase.</p></div>
            <span className="step-symbol step-symbol-green" aria-hidden="true">✓</span>
          </article>
        </div>
      </section>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#top"><span className="brand-mark" aria-hidden="true">h</span><span>habico</span></a>
        <p>Good housemates. Better reminders.</p>
        <a href="#top" className="back-top">BACK TO TOP <span aria-hidden="true">↑</span></a>
      </footer>
    </main>
  );
}
