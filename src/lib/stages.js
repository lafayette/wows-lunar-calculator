// Shared helpers for working with TEAMS data.

export function stageKey(stageStr) {
  const [a, b] = String(stageStr).split('.')
  return Number(a) * 1000 + Number(b)
}

// Builds:
// - teams: sorted team names
// - teamIdToName / teamNameToId maps
// - byTeam: teamName -> ordered flat stages
// - allFlat: all stages across teams
export function buildStageIndex(TEAMS) {
  const teamIdToName = new Map()
  const teamNameToId = new Map()

  for (const t0 of TEAMS) {
    if (typeof t0?.id === 'number' && typeof t0?.team === 'string') {
      teamIdToName.set(t0.id, t0.team)
      teamNameToId.set(t0.team, t0.id)
    }
  }

  const teams = TEAMS.map(t0 => t0.team).sort((a, b) => a.localeCompare(b))
  const byTeam = new Map()
  const allFlat = []

  for (const teamObj of TEAMS) {
    const flat = []

    const rewardsSorted = [...teamObj.rewards].sort((a, b) => a.id - b.id)
    for (const reward of rewardsSorted) {
      const stagesSorted = [...reward.stages].sort((a, b) => a.id - b.id)
      const lastStageId = stagesSorted.length ? stagesSorted[stagesSorted.length - 1].id : null

      for (const st of stagesSorted) {
        const row = {
          team: teamObj.team,
          reward: reward.name,
          stage: `${reward.id}.${st.id}`,
          token_amount: st.tokens,
          coal_amount: st.coal,
          is_reward_stage: lastStageId !== null && st.id === lastStageId
        }
        flat.push(row)
        allFlat.push(row)
      }
    }

    flat.sort((x, y) => stageKey(x.stage) - stageKey(y.stage))
    byTeam.set(teamObj.team, flat)
  }

  return {
    teams,
    teamIdToName,
    teamNameToId,
    byTeam,
    allFlat
  }
}
