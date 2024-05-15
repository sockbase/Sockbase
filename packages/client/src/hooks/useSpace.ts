import saveAs from 'file-saver'
import * as XLSX from 'xlsx'
import type {
  SockbaseEvent,
  SockbaseApplicationDocument,
  SockbaseApplicationMeta,
  SockbaseAccount,
  SockbaseApplicationLinksDocument,
  SockbaseApplicationOverviewDocument
} from 'sockbase'

interface IUseSpace {
  exportCSV: (
    apps: Record<string, SockbaseApplicationDocument>,
    metas: Record<string, SockbaseApplicationMeta>,
    users: Record<string, SockbaseAccount>,
    links: Record<string, SockbaseApplicationLinksDocument | null>,
    overviews: Record<string, SockbaseApplicationOverviewDocument | null>
  ) => string
  downloadSpaceDataXLSX: (
    eventId: string,
    event: SockbaseEvent,
    apps: Record<string, SockbaseApplicationDocument>,
    metas: Record<string, SockbaseApplicationMeta>,
    users: Record<string, SockbaseAccount>,
    links: Record<string, SockbaseApplicationLinksDocument | null>,
    overviews: Record<string, SockbaseApplicationOverviewDocument | null>
  ) => void
}

const useSpace = (): IUseSpace => {
  const exportCSV = (
    apps: Record<string, SockbaseApplicationDocument>,
    metas: Record<string, SockbaseApplicationMeta>,
    users: Record<string, SockbaseAccount>,
    links: Record<string, SockbaseApplicationLinksDocument | null>,
    overviews: Record<string, SockbaseApplicationOverviewDocument | null>): string => {
    const header =
      'eventId\tid\tstatus\tname\tyomi\tpenName\tgenre\tspace\thasAdult\tunionId\tdescription\ttotalAmount\tremarks\ttwitter\tpixiv\tweb\tmenu\tuserId\temail'
    const entries = Object.entries(apps)
      .map(([id, a]) => [
        a.eventId,
        a.hashId,
        metas[id]?.applicationStatus,
        a.circle.name,
        a.circle.yomi,
        a.circle.penName,
        a.circle.genre,
        a.spaceId,
        a.circle.hasAdult ? '1' : '0',
        a.unionCircleId || 'null',
        (overviews[id]?.description ?? a.overview.description)
          .replaceAll(',', '，')
          .replaceAll(/[\r\n]+/g, ' '),
        (overviews[id]?.totalAmount ?? a.overview.totalAmount)
          .replaceAll(',', '，')
          .replaceAll(/[\r\n]+/g, ' '),
        a.remarks.replaceAll(',', '，').replaceAll(/[\r\n]+/g, ' '),
        links[id]?.twitterScreenName,
        links[id]?.pixivUserId,
        links[id]?.websiteURL,
        links[id]?.menuURL,
        a.userId,
        users[a.userId]?.email
      ])
      .map((a) => a.join('\t'))
      .join('\n')

    return `${header}\n${entries}\n`
  }

  const downloadSpaceDataXLSX = (
    eventId: string,
    event: SockbaseEvent,
    apps: Record<string, SockbaseApplicationDocument>,
    metas: Record<string, SockbaseApplicationMeta>,
    users: Record<string, SockbaseAccount>,
    links: Record<string, SockbaseApplicationLinksDocument | null>,
    overviews: Record<string, SockbaseApplicationOverviewDocument | null>
  ): void => {
    const workbook = XLSX.utils.book_new()

    const appsArray = Object.entries(apps)
      .filter(([id, _]) => metas[id].applicationStatus === 2)
      .map(([id, a], i) => {
        const unionCircle = Object.values(apps).filter(uc => uc.hashId === a.unionCircleId)[0]
        const space = event.spaces.filter(s => s.id === a.spaceId)[0]
        const genre = event.genres.filter(g => g.id === a.circle.genre)[0]

        return [
          null,
          a.hashId,
          a.circle.name,
          a.circle.yomi,
          a.circle.penName,
          genre.name,
          space.name,
          a.circle.hasAdult,
          unionCircle?.circle.name,
          (overviews[id]?.description ?? a.overview.description)
            .replaceAll(',', '，')
            .replaceAll(/[\r\n]+/g, ' '),
          (overviews[id]?.totalAmount ?? a.overview.totalAmount)
            .replaceAll(',', '，')
            .replaceAll(/[\r\n]+/g, ' '),
          a.remarks,
          links[id]?.twitterScreenName,
          links[id]?.pixivUserId,
          links[id]?.websiteURL,
          links[id]?.menuURL,
          a.userId,
          users[a.userId]?.email
        ]
      })

    const applicationDataSheet = XLSX.utils.aoa_to_sheet([
      [`${event.eventName} 配置データ作成`],
      [''],
      ['', '→B列以降は変更しても反映されません。'],
      [
        'スペース番号',
        '申し込みID',
        'サークル名',
        'よみ',
        'ペンネーム',
        'ジャンル',
        'スペース',
        '成人向け',
        '合体サークル',
        '頒布物概要',
        '総搬入量',
        '備考',
        'Twitter',
        'Pixiv',
        'Web',
        'お品書き',
        'ユーザID',
        'メールアドレス'
      ],
      ...appsArray
    ])

    XLSX.utils.book_append_sheet(workbook, applicationDataSheet, '配置データ')

    const excelUnit8Array = XLSX.write(workbook, { type: 'array' })
    const excelBlob = new Blob(
      [excelUnit8Array],
      { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

    const now = new Date().getTime()
    saveAs(excelBlob, `${eventId}_${now}`)
  }

  return {
    exportCSV,
    downloadSpaceDataXLSX
  }
}

export default useSpace
