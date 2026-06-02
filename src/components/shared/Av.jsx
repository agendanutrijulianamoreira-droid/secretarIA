// Avatar circular com iniciais e cor personalizada
export default function Av({ initials, color, size = 40 }) {
  return (
    <div
      className="rounded-2xl flex items-center justify-center font-black border shadow-inner transition-transform duration-500"
      style={{
        width: size, height: size,
        backgroundColor: color + '15',
        color,
        borderColor: color + '30',
        fontSize: size * 0.35,
        letterSpacing: '0.05em',
      }}
    >
      {initials}
    </div>
  );
}
