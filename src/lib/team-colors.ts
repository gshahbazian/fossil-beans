type TeamColors = {
  primary: string
  secondary: string
  darkPrimary: string
  darkSecondary: string
}

export function getTeamColors(teamAbbr: string): TeamColors {
  // Helper function to create dark mode variants with appropriate adjustments
  const adjustForDarkMode = (color: string): string => {
    // Parse the OKLCH color to get components
    const match = color.match(/oklch\(([0-9.]+) ([0-9.]+) ([0-9.]+)\)/)
    if (!match || match.length < 4) return color

    const lightness = Number(match[1])
    const chroma = Number(match[2])
    const hue = Number(match[3])

    if (isNaN(lightness) || isNaN(chroma) || isNaN(hue)) return color

    // For dark purples and blues (hue between 240-300), reduce chroma and increase lightness
    if (hue >= 240 && hue <= 300) {
      // Desaturate and lighten dark purples and blues
      return `oklch(${Math.min(lightness + 0.2, 0.9)} ${Math.max(chroma - 0.05, 0.1)} ${hue})`
    }

    // For other colors, just increase lightness slightly
    return `oklch(${Math.min(lightness + 0.1, 0.9)} ${chroma} ${hue})`
  }

  const colorMap: Record<string, TeamColors> = {
    // Eastern Conference
    ATL: {
      primary: 'oklch(0.55 0.25 30)',
      secondary: 'oklch(0.8 0.15 120)',
      darkPrimary: 'oklch(0.65 0.25 30)',
      darkSecondary: 'oklch(0.85 0.15 120)',
    },
    BOS: {
      primary: 'oklch(0.45 0.18 150)',
      secondary: 'oklch(0.7 0.1 80)',
      darkPrimary: 'oklch(0.6 0.15 150)',
      darkSecondary: 'oklch(0.75 0.1 80)',
    },
    BKN: {
      primary: 'oklch(0.1 0.01 240)',
      secondary: 'oklch(0.98 0.01 240)',
      darkPrimary: 'oklch(0.3 0.01 240)',
      darkSecondary: 'oklch(0.9 0.01 240)',
    },
    CHA: {
      primary: 'oklch(0.3 0.2 280)',
      secondary: 'oklch(0.5 0.18 200)',
      darkPrimary: 'oklch(0.5 0.15 280)',
      darkSecondary: 'oklch(0.6 0.15 200)',
    },
    CHI: {
      primary: 'oklch(0.5 0.25 25)',
      secondary: 'oklch(0.1 0.01 240)',
      darkPrimary: 'oklch(0.6 0.25 25)',
      darkSecondary: 'oklch(0.3 0.01 240)',
    },
    CLE: {
      primary: 'oklch(0.4 0.25 25)',
      secondary: 'oklch(0.25 0.2 260)',
      darkPrimary: 'oklch(0.5 0.25 25)',
      darkSecondary: 'oklch(0.45 0.15 260)',
    },
    DET: {
      primary: 'oklch(0.5 0.25 25)',
      secondary: 'oklch(0.4 0.2 260)',
      darkPrimary: 'oklch(0.6 0.25 25)',
      darkSecondary: 'oklch(0.5 0.15 260)',
    },
    IND: {
      primary: 'oklch(0.3 0.2 260)',
      secondary: 'oklch(0.8 0.15 80)',
      darkPrimary: 'oklch(0.5 0.15 260)',
      darkSecondary: 'oklch(0.85 0.15 80)',
    },
    MIA: {
      primary: 'oklch(0.4 0.25 25)',
      secondary: 'oklch(0.7 0.15 60)',
      darkPrimary: 'oklch(0.5 0.25 25)',
      darkSecondary: 'oklch(0.75 0.15 60)',
    },
    MIL: {
      primary: 'oklch(0.35 0.18 150)',
      secondary: 'oklch(0.9 0.05 80)',
      darkPrimary: 'oklch(0.5 0.15 150)',
      darkSecondary: 'oklch(0.95 0.05 80)',
    },
    NYK: {
      primary: 'oklch(0.5 0.2 220)',
      secondary: 'oklch(0.7 0.15 60)',
      darkPrimary: 'oklch(0.6 0.15 220)',
      darkSecondary: 'oklch(0.75 0.15 60)',
    },
    ORL: {
      primary: 'oklch(0.5 0.2 220)',
      secondary: 'oklch(0.8 0.02 240)',
      darkPrimary: 'oklch(0.6 0.15 220)',
      darkSecondary: 'oklch(0.9 0.02 240)',
    },
    PHI: {
      primary: 'oklch(0.5 0.2 220)',
      secondary: 'oklch(0.5 0.25 25)',
      darkPrimary: 'oklch(0.6 0.15 220)',
      darkSecondary: 'oklch(0.6 0.25 25)',
    },
    TOR: {
      primary: 'oklch(0.5 0.25 25)',
      secondary: 'oklch(0.1 0.01 240)',
      darkPrimary: 'oklch(0.6 0.25 25)',
      darkSecondary: 'oklch(0.3 0.01 240)',
    },
    WAS: {
      primary: 'oklch(0.3 0.2 260)',
      secondary: 'oklch(0.5 0.25 25)',
      darkPrimary: 'oklch(0.5 0.15 260)',
      darkSecondary: 'oklch(0.6 0.25 25)',
    },

    // Western Conference
    DAL: {
      primary: 'oklch(0.45 0.2 220)',
      secondary: 'oklch(0.3 0.2 260)',
      darkPrimary: 'oklch(0.6 0.15 220)',
      darkSecondary: 'oklch(0.5 0.15 260)',
    },
    DEN: {
      primary: 'oklch(0.25 0.15 260)',
      secondary: 'oklch(0.8 0.15 80)',
      darkPrimary: 'oklch(0.45 0.1 260)',
      darkSecondary: 'oklch(0.85 0.15 80)',
    },
    GSW: {
      primary: 'oklch(0.45 0.2 240)',
      secondary: 'oklch(0.8 0.15 80)',
      darkPrimary: 'oklch(0.6 0.15 240)',
      darkSecondary: 'oklch(0.85 0.15 80)',
    },
    HOU: {
      primary: 'oklch(0.5 0.25 25)',
      secondary: 'oklch(0.1 0.01 240)',
      darkPrimary: 'oklch(0.6 0.25 25)',
      darkSecondary: 'oklch(0.3 0.01 240)',
    },
    LAC: {
      primary: 'oklch(0.5 0.25 25)',
      secondary: 'oklch(0.45 0.2 240)',
      darkPrimary: 'oklch(0.6 0.25 25)',
      darkSecondary: 'oklch(0.6 0.15 240)',
    },
    LAL: {
      primary: 'oklch(0.4 0.2 300)',
      secondary: 'oklch(0.75 0.15 80)',
      darkPrimary: 'oklch(0.55 0.15 300)',
      darkSecondary: 'oklch(0.8 0.15 80)',
    },
    MEM: {
      primary: 'oklch(0.6 0.1 260)',
      secondary: 'oklch(0.2 0.15 260)',
      darkPrimary: 'oklch(0.7 0.1 260)',
      darkSecondary: 'oklch(0.4 0.1 260)',
    },
    MIN: {
      primary: 'oklch(0.25 0.15 260)',
      secondary: 'oklch(0.45 0.2 220)',
      darkPrimary: 'oklch(0.45 0.1 260)',
      darkSecondary: 'oklch(0.6 0.15 220)',
    },
    NOP: {
      primary: 'oklch(0.25 0.15 260)',
      secondary: 'oklch(0.5 0.25 25)',
      darkPrimary: 'oklch(0.45 0.1 260)',
      darkSecondary: 'oklch(0.6 0.25 25)',
    },
    OKC: {
      primary: 'oklch(0.5 0.2 220)',
      secondary: 'oklch(0.5 0.25 25)',
      darkPrimary: 'oklch(0.6 0.15 220)',
      darkSecondary: 'oklch(0.6 0.25 25)',
    },
    PHX: {
      primary: 'oklch(0.3 0.2 280)',
      secondary: 'oklch(0.6 0.2 40)',
      darkPrimary: 'oklch(0.5 0.15 280)',
      darkSecondary: 'oklch(0.7 0.2 40)',
    },
    POR: {
      primary: 'oklch(0.5 0.25 25)',
      secondary: 'oklch(0.1 0.01 240)',
      darkPrimary: 'oklch(0.6 0.25 25)',
      darkSecondary: 'oklch(0.3 0.01 240)',
    },
    SAC: {
      primary: 'oklch(0.4 0.2 300)',
      secondary: 'oklch(0.6 0.05 240)',
      darkPrimary: 'oklch(0.55 0.15 300)',
      darkSecondary: 'oklch(0.7 0.05 240)',
    },
    SAS: {
      primary: 'oklch(0.8 0.02 240)',
      secondary: 'oklch(0.1 0.01 240)',
      darkPrimary: 'oklch(0.9 0.02 240)',
      darkSecondary: 'oklch(0.3 0.01 240)',
    },
    UTA: {
      primary: 'oklch(0.3 0.2 260)',
      secondary: 'oklch(0.35 0.18 150)',
      darkPrimary: 'oklch(0.5 0.15 260)',
      darkSecondary: 'oklch(0.5 0.15 150)',
    },

    // Default fallback
    DEFAULT: {
      primary: 'oklch(0.45 0.2 240)',
      secondary: 'oklch(0.5 0.25 25)',
      darkPrimary: 'oklch(0.6 0.15 240)',
      darkSecondary: 'oklch(0.6 0.25 25)',
    },
  }

  // Get team colors with fallback to DEFAULT
  const team = colorMap[teamAbbr] || colorMap['DEFAULT']
  if (!team) {
    throw new Error(`Team colors not found for ${teamAbbr}`)
  }

  // Return the team colors with adjusted dark mode variants
  return {
    ...team,
    darkPrimary: adjustForDarkMode(team.darkPrimary),
    darkSecondary: adjustForDarkMode(team.darkSecondary),
  }
}
