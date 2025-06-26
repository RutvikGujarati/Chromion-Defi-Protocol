import React, { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadLinksPreset } from "tsparticles-preset-links";
import { useMemo } from "react";

const ParticlesBg = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadLinksPreset(engine);
  }, []);

  const particlesOptions = useMemo(
    () => ({
      preset: "links",
      background: {
        color: {
          value: "#0f0f1a",
        },
      },
      fullScreen: {
        enable: true,
        zIndex: -1,
      },
      particles: {
        number: {
          value: 70,
          density: {
            enable: true,
            area: 800,
          },
        },
        color: {
          value: ["#00d4ff", "#ff00ff", "#ffffff"],
        },
        links: {
          enable: true,
          color: "#ff00ff",
          distance: 140,
          opacity: 0.4,
          width: 1,
          triangles: {
            enable: true,
            opacity: 0.05,
          },
        },
        move: {
          enable: true,
          speed: 1, // 👈 slower movement
          direction: "none",
          outModes: {
            default: "bounce",
          },
        },
        size: {
          value: { min: 1, max: 3 },
        },
        opacity: {
          value: 0.5,
        },
        shape: {
          type: "circle",
        },
      },
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: ["grab", "repulse"],
          },
          onClick: {
            enable: true,
            mode: "push",
          },
          resize: true,
        },
        modes: {
          grab: {
            distance: 140,
            links: {
              opacity: 0.7,
            },
          },
          repulse: {
            distance: 100,
            duration: 0.4,
          },
          push: {
            quantity: 2,
          },
        },
      },
      detectRetina: true,
    }),
    []
  );

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={particlesOptions}
    />
  );
};

export default ParticlesBg;
