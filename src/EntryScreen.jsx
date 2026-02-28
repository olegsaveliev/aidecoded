function EntryScreen({ icon, title, subtitle, taglines, visibleLines = 0, description, buttonText, buttonClassName, onStart, children }) {
  return (
    <div className="entry-screen">
      <div className="entry-screen-icon">{icon}</div>
      <h2 className="entry-screen-title">{title}</h2>
      {taglines ? (
        <div className="entry-screen-taglines">
          {taglines.map((line, i) => (
            <p key={i} className={`entry-screen-tagline ${visibleLines >= i + 1 ? 'visible' : ''}`}>{line}</p>
          ))}
        </div>
      ) : subtitle ? (
        <p className="entry-screen-subtitle">{subtitle}</p>
      ) : null}
      <p className="entry-screen-description">{description}</p>
      <button className={`entry-screen-btn ${buttonClassName || ''}`} onClick={onStart}>
        {buttonText}
      </button>
      {children}
    </div>
  )
}

export default EntryScreen
