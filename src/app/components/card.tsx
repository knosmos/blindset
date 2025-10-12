'use client';
import { useMemo, useState, useEffect } from "react";

/*
    Single card component. Renders one SET card.
*/

export default function Card(
    {
        number,
        color,
        shading,
        shape,
        isFaceUp = false,
        onToggle,
        isVisible = true,
    }: {
        number: number;
        color: string;
        shading: string;
        shape: string;
        isFaceUp?: boolean;
        onToggle?: () => void;
        isVisible?: boolean;
    }) {
        const shapeFile = `/cards/${shape}${color}${shading}.png`;
        const [rotation, setRotation] = useState(0);

        useEffect(() => {
            setRotation(Math.floor(Math.random() * 11) - 5);
        }, [setRotation]);

        return (
            <div
                onClick={onToggle}
                className={`relative w-full perspective transform-3d preserve-3d duration-300 cursor-pointer ${isVisible ? '' : 'invisible'}`}
                style={{ transform: `rotate(${rotation}deg) rotateY(${isFaceUp ? "0deg" : "180deg"}` }}
            >
                <div
                    className={`shadow-purple-300 shadow-md border-purple-300 backface-hidden border rounded-xl p-2 bg-white flex justify-center flex-wrap`}
                >
                    {[...Array(number)].map((_, i) => (
                        <img key={i} src={shapeFile} className="w-1/4 block p-1"/>
                    ))}
                </div>
                <div
                    className="absolute inset-0 border border-purple-300 backface-hidden rotate-y-180  shadow-md rounded-xl bg-purple-200 p-2 flex items-center justify-center"
                    style={{
                        backgroundImage: "linear-gradient(135deg, white 25%, transparent 25%), linear-gradient(225deg, white 25%, transparent 25%), linear-gradient(45deg, white 25%, transparent 25%), linear-gradient(315deg, white 25%, #f6edfa 25%)",
                        backgroundSize: "20px 20px",
                    }}
                >
                    <span className="text-md text-purple-400 font-sans border-1 border-black-400 rounded-md p-1 sm:p-3 tracking-widest">BLINDSET</span>
                </div>
            </div>
        );
    }