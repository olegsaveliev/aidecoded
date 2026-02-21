function EntryScreen({ icon, title, description, buttonText, onStart }) {
  return (
    <div className="entry-screen">
      <div className="entry-screen-icon">{icon}</div>
      <h2 className="entry-screen-title">{title}</h2>
      <p className="entry-screen-description">{description}</p>
      <button className="entry-screen-btn" onClick={onStart}>
        {buttonText}
      </button>
    </div>
  )
}

export default EntryScreen
