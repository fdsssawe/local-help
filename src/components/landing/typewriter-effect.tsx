"use client";

import { cn } from "~/lib/utils";
import { useEffect, useState } from "react";

export const TypewriterEffect = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const typingInterval = 120; // Time between each character typing
    const deletingInterval = 80; // Time between each character deleting
    const pauseInterval = 1500; // Time to pause after typing a word

    if (isDeleting) {
      // Deleting characters
      if (currentText.length === 0) {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      } else {
        const timeout = setTimeout(() => {
          setCurrentText((prev) => prev.slice(0, -1));
        }, deletingInterval);
        return () => clearTimeout(timeout);
      }
    } else {
      // Typing characters
      const currentWord = words[currentWordIndex].text;
      if (currentText.length === currentWord.length) {
        // Pause before deleting
        const timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseInterval);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setCurrentText((prev) => 
            currentWord.slice(0, prev.length + 1));
        }, typingInterval);
        return () => clearTimeout(timeout);
      }
    }
  }, [currentText, currentWordIndex, isDeleting, words]);

  return (
    <div className={cn("inline-block", className)}>
      <span className="inline-block">
        {currentText}
        <span
          className={cn(
            "ml-1 inline-block h-5 w-[3px] animate-blink bg-primary",
            cursorClassName
          )}
        />
      </span>
    </div>
  );
};

export const TypewriterEffectSmooth = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}) => {
  // Split words into characters
  const wordsWithCharacters = words.map((word) => {
    return {
      ...word,
      characters: word.text.split(""),
    };
  });
  
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  const currentWord = wordsWithCharacters[currentWordIndex];
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const typingInterval = 120; // Speed of typing
    const deletingInterval = 80; // Speed of deleting
    const pauseInterval = 1500; // Pause after completing a word

    if (!isDeleting && currentCharacterIndex === currentWord.characters.length) {
      // Finished typing the current word
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseInterval);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && currentCharacterIndex === 0) {
      // Finished deleting the current word
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % wordsWithCharacters.length);
      return;
    }

    const timeout = setTimeout(() => {
      setCurrentCharacterIndex((prev) => {
        if (isDeleting) return prev - 1;
        return prev + 1;
      });
    }, isDeleting ? deletingInterval : typingInterval);

    return () => clearTimeout(timeout);
  }, [currentCharacterIndex, currentWord.characters.length, isDeleting, currentWordIndex, wordsWithCharacters.length]);

  return (
    <div className={cn("inline-block", className)}>
      <div className="inline-block">
        {wordsWithCharacters.map((word, wordIndex) => {
          return (
            <div key={word.text} className={cn("absolute inline-block", {
              "opacity-100": currentWordIndex === wordIndex,
              "opacity-0": currentWordIndex !== wordIndex,
            })}>
              {word.characters.map((character, characterIndex) => {
                return (
                  <span key={characterIndex} className={cn({
                    "opacity-100": !isDeleting && currentWordIndex === wordIndex && currentCharacterIndex > characterIndex,
                    "opacity-0": isDeleting && currentWordIndex === wordIndex && currentCharacterIndex <= characterIndex,
                  }, word.className)}>
                    {character}
                  </span>
                );
              })}
            </div>
          );
        })}
        <span
          className={cn(
            "inline-block h-6 w-[3px] animate-blink bg-primary",
            cursorClassName
          )}
        />
      </div>
    </div>
  );
};