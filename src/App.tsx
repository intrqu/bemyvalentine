import React, { useEffect, useRef, useState } from "react";
import thanksImg from "./assets/thanks.png";
import "./App.css";

/** Tiny no-library confetti burst */
function ConfettiBurst({ fire }: { fire: boolean }) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		if (!fire) return;

		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const resize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};
		resize();
		window.addEventListener("resize", resize);

		const colors = [
			"#ff4d6d",
			"#ffd166",
			"#06d6a0",
			"#4dabf7",
			"#b197fc",
			"#ffffff",
		];
		const gravity = 0.12;
		const drag = 0.992;

		type P = {
			x: number;
			y: number;
			vx: number;
			vy: number;
			size: number;
			rot: number;
			vr: number;
			color: string;
			life: number;
		};

		const particles: P[] = [];
		const centerX = canvas.width / 2;
		const centerY = canvas.height / 2 - 40;

		const count = 180;
		for (let i = 0; i < count; i++) {
			const angle = Math.random() * Math.PI * 2;
			const speed = 3 + Math.random() * 7;

			particles.push({
				x: centerX,
				y: centerY,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed - (2 + Math.random() * 3),
				size: 4 + Math.random() * 6,
				rot: Math.random() * Math.PI,
				vr: (Math.random() - 0.5) * 0.25,
				color: colors[(Math.random() * colors.length) | 0],
				life: 140 + ((Math.random() * 60) | 0),
			});
		}

		let raf = 0;

		const tick = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			for (const p of particles) {
				p.vx *= drag;
				p.vy *= drag;
				p.vy += gravity;

				p.x += p.vx;
				p.y += p.vy;

				p.rot += p.vr;
				p.life -= 1;

				ctx.save();
				ctx.translate(p.x, p.y);
				ctx.rotate(p.rot);
				ctx.fillStyle = p.color;
				ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.7);
				ctx.restore();
			}

			for (let i = particles.length - 1; i >= 0; i--) {
				if (particles[i].life <= 0) particles.splice(i, 1);
			}

			if (particles.length > 0) raf = requestAnimationFrame(tick);
		};

		raf = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("resize", resize);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		};
	}, [fire]);

	if (!fire) return null;

	return (
		<canvas
			ref={canvasRef}
			style={{
				position: "fixed",
				inset: 0,
				pointerEvents: "none",
				zIndex: 9999,
			}}
		/>
	);
}

function App() {
	const [showThanks, setShowThanks] = useState(false);

	const cardRef = useRef<HTMLDivElement | null>(null);
	const noBtnRef = useRef<HTMLButtonElement | null>(null);

	const [isRunning, setIsRunning] = useState(false);
	const [noPosition, setNoPosition] = useState({ left: 0, top: 0 });

	const [confetti, setConfetti] = useState(false);

	const moveNoButton = () => {
		const card = cardRef.current;
		const btn = noBtnRef.current;
		if (!card || !btn) return;

		const cardRect = card.getBoundingClientRect();
		const btnRect = btn.getBoundingClientRect();

		const padding = 12;

		const maxLeft = cardRect.width - btnRect.width - padding * 2;
		const maxTop = cardRect.height - btnRect.height - padding * 2;

		if (maxLeft <= 0 || maxTop <= 0) return;

		const newLeft = padding + Math.random() * maxLeft;
		const newTop = padding + Math.random() * maxTop;

		setNoPosition({ left: newLeft, top: newTop });
		setIsRunning(true);
	};

	const dodgeNo = (e: React.SyntheticEvent) => {
		// Helps on touch so it doesn't also click/focus/scroll weirdly
		e.preventDefault();
		moveNoButton();
	};

	const handleYes = () => {
		setConfetti(true);
		setTimeout(() => setConfetti(false), 900);
		setShowThanks(true);
	};

	return (
		<>
			<ConfettiBurst fire={confetti} />

			<div
				ref={cardRef}
				className="card"
				style={{
					position: "relative",
					height: "90vh",
					overflow: "hidden",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
					gap: "28px",
				}}
			>
				<h1>Be My Valentine?</h1>

				{!showThanks && (
					<>
						{/* Inline layout row */}
						<div
							className="button-row"
							style={{
								display: "flex",
								gap: "24px",
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<button onClick={handleYes}>yes</button>

							{/* Placeholder slot keeps spacing inline */}
							<div style={{ width: "72px", height: "44px" }}>
								{!isRunning && (
									<button
										ref={noBtnRef}
										onMouseEnter={moveNoButton}
										onPointerDown={dodgeNo}
										onTouchStart={dodgeNo}
									>
										no
									</button>
								)}
							</div>
						</div>

						{/* Once running, render the real no button absolutely inside the card */}
						{isRunning && (
							<button
								ref={noBtnRef}
								onMouseEnter={moveNoButton}
								onPointerDown={dodgeNo}
								onTouchStart={dodgeNo}
								style={{
									position: "absolute",
									left: noPosition.left,
									top: noPosition.top,
								}}
							>
								no
							</button>
						)}
					</>
				)}

				{showThanks && (
					<img
						src={thanksImg}
						alt="Thanks!"
						style={{
							width: "260px",
							maxWidth: "70vw",
							height: "auto",
						}}
					/>
				)}
			</div>
		</>
	);
}

export default App;
