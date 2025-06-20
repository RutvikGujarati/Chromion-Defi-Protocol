import React from "react";
import Particles from "react-tsparticles";
import { loadLinksPreset } from "tsparticles-preset-links";
import "./Particle.css"

const ParticlesBg = () => {
  const particlesInit = async (main) => {
    await loadLinksPreset(main);
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        preset: "links",
        background: {
          color: {
            value: "#0f0f1a", // Dark background
          },
        },
        fullScreen: {
          enable: true,
          zIndex: -1,
        },
        particles: {
          color: {
            value: "#00d4ff",
          },
          links: {
            enable: true,
            color: "#ff00ff",
            distance: 150,
            opacity: 0.3,
            width: 1,
          },
          move: {
            enable: true,
            speed: 1.5,
          },
          number: {
            value: 60,
          },
          opacity: {
            value: 0.5,
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 1, max: 3 },
          },
        },
        detectRetina: true,
      }}
    />
  );
};

export default ParticlesBg;
