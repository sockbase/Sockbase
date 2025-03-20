import { useMemo } from 'react'
import { FaTwitter } from 'react-icons/fa6'
import { MdInfo, MdWeb } from 'react-icons/md'
import styled from 'styled-components'
import ApplicationCompleteImage from '../../../../assets/application-complete.png'
import FormItem from '../../../../components/Form/FormItem'
import FormSection from '../../../../components/Form/FormSection'
import AnchorButton from '../../../../components/Parts/AnchorButton'
import IconLabel from '../../../../components/Parts/IconLabel'
import LinkButton from '../../../../components/Parts/LinkButton'
import useDayjs from '../../../../hooks/useDayjs'
import type { SockbaseApplicationCreateResult, SockbaseEventDocument } from 'sockbase'

interface Props {
  event: SockbaseEventDocument | undefined
  addedResult: SockbaseApplicationCreateResult | undefined
}
const Complete: React.FC<Props> = props => {
  const { formatByDate } = useDayjs()

  const tweetText = useMemo(() => {
    if (!props.event) return
    const postURL = 'https://twitter.com/intent/tweet?text='
    const message = `「${props.event.name}」に申し込みました！\n${props.event.websiteURL}\n\n`
    return `${postURL}${encodeURIComponent(message)}`
  }, [props.event])

  return (
    <>
      <ApplicationCompleteArea>
        <ApplicationCompleteLogotype src={ApplicationCompleteImage} />
        <p>
          「{props.event?.name}」へのサークル申し込み手続きが完了しました。<br />
          お申し込みいただきましてありがとうございました。<br />
          <TweetButton
            href={tweetText}
            rel="noopener noreferrer"
            target="_blank">
            <IconLabel
              icon={<FaTwitter />}
              label="Twitterでシェアする" />
          </TweetButton>
        </p>
      </ApplicationCompleteArea>

      <h2>サークルカットの提出・差し替え</h2>
      <p>
        サークルカットの提出・差し替えは「申し込み内容確認ページ」から行うことができます。<br />
        <b>{formatByDate((props.event?.schedules.overviewFixedAt ?? 0) - 1, 'YYYY年M月D日')}</b>時点の情報を元にカタログ等を制作いたしますので、変更がある場合はこの日までにご提出いただくようお願いいたします。
      </p>

      <FormSection>
        <FormItem $inlined>
          <LinkButton
            color="primary"
            to={`/dashboard/applications/${props.addedResult?.hashId}`}>
            <IconLabel
              icon={<MdInfo />}
              label="申し込み内容を確認する" />
          </LinkButton>
          <AnchorButton href={props.event?.websiteURL}>
            <IconLabel
              icon={<MdWeb />}
              label="イベントサイトへ戻る" />
          </AnchorButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default Complete

const ApplicationCompleteArea = styled.div`
  margin-bottom: 20px;
  text-align: center;
`
const ApplicationCompleteLogotype = styled.img`
  margin-bottom: 10px;
  max-width: 100%;
  max-height: 128px;
`
const TweetButton = styled.a`
  display: inline-block;
  margin-top: 10px;
  padding: 2px 20px;
  background-color: #1da1f2;
  color: white;
  border-radius: 5px;
  text-decoration: none;
  transition: background-color 0.3s;
  &:hover {
    background-color: #118be3;
  }
`
