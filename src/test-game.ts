/**
 * 本地测试脚本 — 模拟两个 agent 对战一局完整的五子棋
 *
 * 用法：
 *   1. 先启动游戏服务器: npm run dev
 *   2. 另一个终端运行:   npx tsx src/test-game.ts
 *
 * 这个脚本不需要 Redis/DB/bout API，直接通过 HTTP 协议与游戏服务器交互。
 */

const BASE = process.env.GAME_URL || 'http://localhost:4000'

async function main() {
  // 1. 获取游戏元数据
  console.log('=== 获取游戏元数据 ===')
  const metaRes = await fetch(`${BASE}/bout/meta`)
  const meta = await metaRes.json()
  console.log(`游戏: ${meta.meta.name} v${meta.meta.version}`)
  console.log(`工具: ${meta.tools.map((t: any) => t.name).join(', ')}`)
  console.log()

  // 2. 创建游戏实例
  console.log('=== 创建游戏实例 ===')
  const createRes = await fetch(`${BASE}/bout/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agents: ['alice', 'bob'], wager: '1000' }),
  })
  const { instanceId } = await createRes.json()
  console.log(`实例 ID: ${instanceId}`)
  console.log()

  // 3. 预设一局对战走法 — 黑棋(alice)横排五连胜
  const moves: [string, number, number][] = [
    ['alice', 7, 3],   // 黑 ●
    ['bob',   8, 3],   // 白 ○
    ['alice', 7, 4],   // 黑 ●
    ['bob',   8, 4],   // 白 ○
    ['alice', 7, 5],   // 黑 ●
    ['bob',   8, 5],   // 白 ○
    ['alice', 7, 6],   // 黑 ●
    ['bob',   8, 6],   // 白 ○
    ['alice', 7, 7],   // 黑 ● ← 五连！
  ]

  console.log('=== 对战开始 ===')
  for (const [agentId, row, col] of moves) {
    // 查看当前轮次
    const stateRes = await fetch(`${BASE}/bout/games/${instanceId}/state?agent=${agentId}`)
    const stateData = await stateRes.json()
    const symbol = agentId === 'alice' ? '●' : '○'

    console.log(`当前轮到: ${stateData.currentAgent}`)

    // 提交走步
    const actionRes = await fetch(`${BASE}/bout/games/${instanceId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId,
        action: { tool: 'place_stone', args: { row, col } },
      }),
    })
    const result = await actionRes.json()
    console.log(`${agentId} ${symbol} → (${row}, ${col})  事件: ${result.events.map((e: any) => e.type).join(',')}`)

    if (result.terminated) {
      console.log()
      console.log('=== 游戏结束！ ===')
      break
    }
  }

  // 4. 检查终局状态
  const termRes = await fetch(`${BASE}/bout/games/${instanceId}/terminal`)
  const termData = await termRes.json()
  console.log(`终局: ${termData.terminated}`)

  // 5. 结算
  console.log()
  console.log('=== 结算 ===')
  const settleRes = await fetch(`${BASE}/bout/games/${instanceId}/settle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wager: '1000', feeBps: 1000 }),
  })
  const settlement = await settleRes.json()
  console.log(`胜者: ${settlement.winner}`)
  console.log(`分配: ${JSON.stringify(settlement.amounts)}`)
  console.log(`协议费: ${settlement.protocolFee}`)
  console.log()
  console.log('✅ 测试完成！整个 Open Game Protocol 流程正常运行。')
}

main().catch((err) => {
  console.error('❌ 测试失败:', err.message)
  process.exit(1)
})
