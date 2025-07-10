import { useEffect, useState } from "react";
import Cell from "./cell";

interface InputRowProps {
    letters: string[];
    onLetterAdd: (letter: string) => void;
    onLetterRemove: () => void;
    onSubmit: () => void;
}

export default function InputRow({ letters, onLetterAdd, onLetterRemove, onSubmit}: InputRowProps){
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key

            switch (key){
                case 'Backspace':
                    onLetterRemove();
                    break;
                case 'Enter':
                    onSubmit();
                    break;
                default:
                    if (key.length === 1 && /[a-zA-Z]/.test(key)){
                        onLetterAdd(key);
                    }
                    break;
            }
        }
        document.addEventListener('keydown', handleKeyDown);

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [letters, onLetterAdd, onLetterRemove]);

    const paddedLetters = [...letters, ...Array(5 - letters.length).fill('')];

    return(
        <div style={{display : 'flex', gap : '1rem', marginBottom : '1rem'}}>
            {paddedLetters.map((letter, i) => (
                <Cell key={i} letter={letter} status={undefined}></Cell>
            ))}
        </div>
    )
}