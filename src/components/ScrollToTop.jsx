export default function ScrollToCard({ targetId, children }) {
  const handleScroll = () => {
    const element = document.getElementById(targetId);

    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <button
      type="button"
      onClick={handleScroll}
      className="cursor-pointer"
    >
      {children}
    </button>
  );
}