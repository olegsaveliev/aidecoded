function EntryScreen({ icon, title, subtitle, description, buttonText, onStart }) {
  return (
    <div className="entry-screen">
      <div className="entry-screen-icon">{icon}</div>
      <h2 className="entry-screen-title">{title}</h2>
      {subtitle && <p className="entry-screen-subtitle">{subtitle}</p>}
      <p className="entry-screen-description">{description}</p>
      <button className="entry-screen-btn" onClick={onStart}>
        {buttonText}
      </button>
    </div>
  )
}

export default EntryScreen
