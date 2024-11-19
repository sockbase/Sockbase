import type {
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
}

const useSpace = (): IUseSpace => {
  const exportCSV =
    (
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

  return {
    exportCSV
  }
}

export default useSpace
