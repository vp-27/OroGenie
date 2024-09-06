import React, { useState, useEffect } from 'react';

const AnimatedGreeting = () => {
  const [text, setText] = useState('');
  const fullText = "Let your origin story start with";
  // const finalWord = "orogenie";

  // Adjust these values to change the animation speed (in milliseconds)
  const typingSpeed = 50;
  const erasingSpeed = 50;
  const transformationSpeed = 200;

  useEffect(() => {
    // Initialize variables for text animation
    let currentIndex = 0; // Current index of the text being displayed
    let leftIndex = 0; // Left index for erasing text
    let rightIndex = fullText.length; // Right index for erasing text
    let isTyping = true; // Flag to indicate if text is being typed
    let isErasing = false; // Flag to indicate if text is being erased
    let eraseAfterOrigin = true; // Flag to indicate if text should be erased after "origin"
    let timer; // Timer for text animation

    // Function to animate the text
    const animateText = () => {
      if (isTyping && currentIndex <= fullText.length) {
        // If typing and not reached the end of the full text
        setText(fullText.slice(0, currentIndex)); // Set the text to the current substring
        currentIndex++; // Increment the current index
        if (currentIndex > fullText.length) {
          // If reached the end of the full text
          isTyping = false; // Set typing flag to false
          isErasing = true; // Set erasing flag to true
        }
      } else if (isErasing) {
        if (eraseAfterOrigin) {
          // If erasing text after "origin"
          if (rightIndex > fullText.indexOf("origin") + "origin".length) {
            // If right index is greater than the index of "origin" + length of "origin"
            setText(fullText.slice(leftIndex, rightIndex)); // Set the text to the current substring
            rightIndex--; // Decrement the right index
          } else {
            eraseAfterOrigin = false; // Set erase after origin flag to false
          }
        } else {
          // If erasing text before "origin"
          if (leftIndex < fullText.indexOf("origin")) {
            // If left index is less than the index of "origin"
            setText(fullText.slice(leftIndex, rightIndex)); // Set the text to the current substring
            leftIndex++; // Increment the left index
          } else {
            setText("origin"); // Set the text to "origin"
            isErasing = false; // Set erasing flag to false
            transformToOrogenie(); // Call the function to transform to "OroGenie"
            return; // Exit the function
          }
        }
      }

      timer = setTimeout(animateText, isTyping ? typingSpeed : erasingSpeed); // Set the timer for the next animation step
    };

    const transformToOrogenie = () => {
      const steps = [
        "orogin",
        "Orogin",
        "OroGin",
        "OroGen",
        "OroGeni",
        "OroGenie"
      ];

      setTimeout(() => {
        // Add 'orogenie' class to the greeting text
        document.querySelector('#greeting-text').classList.add('orogenie');
        const goldenBall = document.querySelector('.golden-ball');
        // Add 'orogenie' class to the golden ball
        goldenBall.classList.add('orogenie');
      }, 1300);

      let stepIndex = 0;
      const stepTimer = setInterval(() => {
        if (stepIndex < steps.length) {
          setText(steps[stepIndex]);
          stepIndex++;
        } else {
          clearInterval(stepTimer);
        }
      }, transformationSpeed);
    };

    animateText();

    return () => clearTimeout(timer);

  }, []);

  return <h1 id="greeting-text">{text}</h1>;
};

export default AnimatedGreeting;
