'use client';

import Board from './components/board';
import React from 'react';
import Card from './components/card';
import { useState } from 'react';

export default function Home() {
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<{ number: number; color: string; shading: string; shape: string }[][] | null>(null);
  return (
    <main className="min-h-screen bg-purple-200 flex flex-col items-center justify-start">
      <div className="lg:grid lg:grid-cols-[4fr_1fr] lg:gap-8 w-full items-start justify-center">
        <div className="text-center w-full">
        <h1 className="text-4xl font-bold text-purple-800 my-8 font-sans tracking-tight">blindset
        <span className='border bg-purple-100 rounded-md border-purple-300 ml-5 px-3'>👀 ×{score}</span></h1>
        <Board setScore={setScore} setHistory={setHistory} />
        </div>
        <div className='p-4 h-full'>
          <div className='p-4 bg-purple-100 rounded-lg border border-purple-300 shadow-md shadow-purple-300 w-full h-full'>
            <h2 className='text-2xl font-semibold text-purple-800 mb-4 font-sans tracking-tight'>history</h2>
            {history ? (
              history.map((set, index) => (
                <div key={index} className='mb-4 last:mb-0'>
                  <div className='grid grid-cols-3 gap-2'>
                    {set.map((card, cardIndex) => (
                <div
                    className={`shadow-purple-300 shadow-md rounded p-2 bg-white flex justify-center flex-wrap`}
                    key={cardIndex}
                >
                    {[...Array(card.number)].map((_, i) => (
                        <img key={i} src={`/cards/${card.shape}${card.color}${card.shading}.png`}
                         className="w-1/4 block px-0.5"/>
                    ))}
                </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className='text-purple-600'>No sets found yet. Are you blind??</p>
            )}
          </div>
        </div>
      </div>
      <footer className="w-full text-center p-4 text-purple-700">
        <p className="text-sm">Made with 💜 and hate by <a href="https://jieruei.github.io" className="underline">knosmos</a></p>
      </footer>
    </main>
  );
}
