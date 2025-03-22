import fs from 'fs'
import { getFirebaseAdmin } from './libs/FirebaseAdmin'
import dayjs from './libs/dayjs'
import { generateRandomCharacters } from './libs/random'

const admin = getFirebaseAdmin()
const db = admin.firestore()

const generateHashId = (now: Date): string => {
  const codeDigit = 12
  const randomId = generateRandomCharacters(codeDigit, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')
  const formatedDateTime = dayjs(now).tz().format('MMDD')
  const hashId = `SP${formatedDateTime}${randomId}`
  return hashId
}

const mock = [
  {
    paymentProductId: 'price_1OuUUnFiQHtnurDvQRcVrfTA',
    createdAt: {
      _seconds: 1710570885,
      _nanoseconds: 771000000
    },
    paymentMethod: 1,
    applicationId: '6LdVYys2BEP53DYUDEnd',
    userId: '4D9NDNHh5JR06wQg8QbaMTqPwFD2',
    paymentAmount: 6000,
    bankTransferCode: '161534',
    ticketId: null,
    paymentId: 'pi_3OuqqhFiQHtnurDv1jxvniO9',
    status: 1,
    updatedAt: {
      _seconds: 1710570971,
      _nanoseconds: 350000000
    },
    purchasedAt: {
      _seconds: 1710570971,
      _nanoseconds: 0
    },
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 2,
    totalAmount: 6000,
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP0316VS58TFDE48M8',
    id: '2hSSMp7hEqlqP6HjIOEi'
  },
  {
    paymentProductId: 'price_1NBB78GphU7BtaJHa4RKQUKh',
    createdAt: {
      _seconds: 1710431513,
      _nanoseconds: 738000000
    },
    paymentMethod: 1,
    applicationId: 'kQv4HcYtawmkoasbkBQZ',
    userId: 'f74VoNb4hBOpnQeiOQL4EihOXqN2',
    paymentAmount: 6000,
    bankTransferCode: '150051',
    ticketId: null,
    paymentId: 'pi_3OuGa6GphU7BtaJH1TIOJyYJ',
    status: 1,
    updatedAt: {
      _seconds: 1710431556,
      _nanoseconds: 761000000
    },
    purchasedAt: {
      _seconds: 1710431556,
      _nanoseconds: 0
    },
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 2,
    totalAmount: 6000,
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP0315HFCFCOG9CHNK',
    id: '7OAr3oSTYYva3jH3pLNU'
  },
  {
    paymentProductId: 'price_1NBB78GphU7BtaJHhhLesqyZ',
    createdAt: {
      _seconds: 1710431170,
      _nanoseconds: 770000000
    },
    paymentMethod: 1,
    applicationId: 'cP3LVag5RsNBeIBFNJE4',
    userId: 'wWD9o5IxM5NUTdZYkl6r3vnx1jm1',
    paymentAmount: 3000,
    bankTransferCode: '150046',
    ticketId: null,
    paymentId: 'pi_3OuGVBGphU7BtaJH0OuFxKy4',
    status: 1,
    updatedAt: {
      _seconds: 1710431253,
      _nanoseconds: 691000000
    },
    purchasedAt: {
      _seconds: 1710431253,
      _nanoseconds: 0
    },
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 2,
    totalAmount: 3000,
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP0315ALH6V7L332VQ',
    id: 'BcDYg0Sn5Y4JQjS9RhEU'
  },
  {
    paymentProductId: 'price_1NXSt3GphU7BtaJH8KvZMaH9',
    createdAt: {
      _seconds: 1710501568,
      _nanoseconds: 678000000
    },
    paymentMethod: 1,
    applicationId: null,
    userId: '4D9NDNHh5JR06wQg8QbaMTqPwFD2',
    paymentAmount: 1500,
    bankTransferCode: '152019',
    ticketId: 'Ex9wVCtDCfLTcTGH0yAN',
    paymentId: 'pi_3OuYnXGphU7BtaJH01BY07cW',
    status: 1,
    updatedAt: {
      _seconds: 1710501583,
      _nanoseconds: 712000000
    },
    purchasedAt: {
      _seconds: 1710501583,
      _nanoseconds: 0
    },
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 2,
    totalAmount: 1500,
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP0315WGCMP18J361L',
    id: 'CmHwmMfJeNa5UYacXHxx'
  },
  {
    paymentProductId: 'price_1OLFuKGphU7BtaJH6hW0NDbs',
    createdAt: {
      _seconds: 1705745412,
      _nanoseconds: 886000000
    },
    paymentMethod: 1,
    applicationId: 'gvRAAJYRwTPLSDUeYhpO',
    userId: '4D9NDNHh5JR06wQg8QbaMTqPwFD2',
    paymentAmount: '4500',
    bankTransferCode: '201910',
    ticketId: null,
    paymentId: 'pi_3OafeXGphU7BtaJH1mrxJKUS',
    status: 1,
    updatedAt: {
      _seconds: 1705761373,
      _nanoseconds: 107000000
    },
    purchasedAt: {
      _seconds: 1705761373,
      _nanoseconds: 0
    },
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 2,
    totalAmount: '4500',
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP01204BEBW7P9UMR4',
    id: 'ET7ZRkWv2GEqO6PcTXkU'
  },
  {
    paymentProductId: 'price_1NXSt3GphU7BtaJH8KvZMaH9',
    createdAt: {
      _seconds: 1710502722,
      _nanoseconds: 480000000
    },
    paymentMethod: 1,
    applicationId: null,
    userId: '4D9NDNHh5JR06wQg8QbaMTqPwFD2',
    paymentAmount: 1500,
    bankTransferCode: '152038',
    ticketId: 'sZeD3Y28KN5ryGrSYiD2',
    paymentId: 'pi_3OvH6EGphU7BtaJH1ENZCNld',
    status: 1,
    updatedAt: {
      _seconds: 1710671878,
      _nanoseconds: 764000000
    },
    purchasedAt: {
      _seconds: 1710671878,
      _nanoseconds: 0
    },
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 2,
    totalAmount: 1500,
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP0315KY3E4IJNAVHJ',
    id: 'EnEZfeFxUf5Le0boKedw'
  },
  {
    paymentProductId: 'price_1NXSt3GphU7BtaJH8KvZMaH9',
    createdAt: {
      _seconds: 1710502343,
      _nanoseconds: 265000000
    },
    paymentMethod: 1,
    applicationId: null,
    userId: '4D9NDNHh5JR06wQg8QbaMTqPwFD2',
    paymentAmount: 1500,
    bankTransferCode: '152032',
    ticketId: 'rk0juYfyGM5A43knWprH',
    paymentId: 'pi_3OvH7cGphU7BtaJH1Olr3Xss',
    status: 1,
    updatedAt: {
      _seconds: 1710671962,
      _nanoseconds: 805000000
    },
    purchasedAt: {
      _seconds: 1710671962,
      _nanoseconds: 0
    },
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 2,
    totalAmount: 1500,
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP0315M8J0EMZX8CTK',
    id: 'GsrvdxP3fVRrE1CbiZMz'
  },
  {
    paymentProductId: 'price_1OLFuKGphU7BtaJH6hW0NDbs',
    createdAt: {
      _seconds: 1710491032,
      _nanoseconds: 187000000
    },
    paymentMethod: 1,
    applicationId: 'oTtnVXBy7RfY2BPJotHz',
    userId: '4D9NDNHh5JR06wQg8QbaMTqPwFD2',
    paymentAmount: 4500,
    bankTransferCode: '151723',
    ticketId: null,
    paymentId: 'pi_3OuW3pGphU7BtaJH0ZGpUfGx',
    status: 1,
    updatedAt: {
      _seconds: 1710491060,
      _nanoseconds: 29000000
    },
    purchasedAt: {
      _seconds: 1710491060,
      _nanoseconds: 0
    },
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 2,
    totalAmount: 4500,
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP0315MM18C2TFLNUM',
    id: 'Hxz0V5pSFSdjsf6leZxz'
  },
  {
    paymentProductId: 'price_1NXSt3GphU7BtaJH8KvZMaH9',
    createdAt: {
      _seconds: 1718689949,
      _nanoseconds: 906000000
    },
    applicationId: null,
    userId: '4D9NDNHh5JR06wQg8QbaMTqPwFD2',
    paymentAmount: 1500,
    bankTransferCode: '181452',
    ticketId: 'vbSzLvbGfLVrkEDAZIlM',
    paymentId: 'pi_3PSuyGGphU7BtaJH0ZOJNPqu',
    updatedAt: {
      _seconds: 1718689968,
      _nanoseconds: 172000000
    },
    purchasedAt: {
      _seconds: 1718689968,
      _nanoseconds: 0
    },
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 2,
    paymentMethod: 1,
    status: 1,
    totalAmount: 1500,
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP0618PR4J4AMCC8GC',
    id: 'JO5HlEaDcOfKoz8v1XhK'
  },
  {
    paymentProductId: 'price_1OuUUnFiQHtnurDviwgV05M4',
    createdAt: {
      _seconds: 1710591143,
      _nanoseconds: 975000000
    },
    paymentMethod: 1,
    applicationId: 'NANcMggLClm8bsVFGDUJ',
    userId: 'ePRHvO6Ms2WO1kWaQF8G8YWMcR93',
    paymentAmount: 3000,
    bankTransferCode: '162112',
    ticketId: null,
    paymentId: 'pi_3Ouw7pFiQHtnurDv0WlXKjUF',
    status: 1,
    updatedAt: {
      _seconds: 1710591253,
      _nanoseconds: 314000000
    },
    purchasedAt: {
      _seconds: 1710591253,
      _nanoseconds: 0
    },
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 2,
    totalAmount: 3000,
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP03161545V5STE8B3',
    id: 'PmiwYCoKonydKDw1Q1KP'
  },
  {
    paymentProductId: 'price_1OLFuKGphU7BtaJH6hW0NDbs',
    createdAt: {
      _seconds: 1703607035,
      _nanoseconds: 408000000
    },
    paymentMethod: 1,
    applicationId: 'JxmXRX0RfRoVh4kKBhjJ',
    userId: '4D9NDNHh5JR06wQg8QbaMTqPwFD2',
    paymentAmount: '4500',
    bankTransferCode: '270110',
    ticketId: null,
    paymentId: 'pi_3ORdDlGphU7BtaJH1tyfiMku',
    status: 1,
    updatedAt: {
      _seconds: 1703607073,
      _nanoseconds: 787000000
    },
    purchasedAt: {
      _seconds: 1703607073,
      _nanoseconds: 0
    },
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 2,
    totalAmount: '4500',
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP1227PFD2ZVJC9Q4Q',
    id: 'RTO02aQLKmVD0aVPcmOv'
  },
  {
    paymentProductId: 'price_1OLFuKGphU7BtaJH6hW0NDbs',
    createdAt: {
      _seconds: 1710218843,
      _nanoseconds: 996000000
    },
    paymentId: '',
    paymentMethod: 1,
    applicationId: 'SdgCAPNLzWTsyZ8oN6TJ',
    userId: 'awhilFLOlOXPseKpapJOVT6ysg12',
    paymentAmount: '4500',
    bankTransferCode: '121347',
    ticketId: null,
    updatedAt: null,
    status: 1,
    purchasedAt: null,
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 2,
    totalAmount: '4500',
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP0312J5LM5GSYJBIB',
    id: 'SKtdlqratdFnqpn9tu93'
  },
  {
    paymentProductId: 'price_1NXSt3GphU7BtaJH8KvZMaH9',
    createdAt: {
      _seconds: 1710501510,
      _nanoseconds: 352000000
    },
    paymentId: '',
    paymentMethod: 2,
    applicationId: null,
    userId: '4D9NDNHh5JR06wQg8QbaMTqPwFD2',
    paymentAmount: 1500,
    bankTransferCode: '152018',
    ticketId: '9Rf8nNKiRUO0qtR5wqw6',
    status: 0,
    updatedAt: null,
    purchasedAt: null,
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 0,
    totalAmount: 1500,
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP03155E9H1DVWRR2S',
    id: 'TycQAxZZl0xX4q4fqLlM'
  },
  {
    paymentProductId: 'price_1OLFuKGphU7BtaJH6hW0NDbs',
    createdAt: {
      _seconds: 1705743798,
      _nanoseconds: 226000000
    },
    paymentId: '',
    paymentMethod: 1,
    applicationId: '12q0WpC23i6UjT4coisA',
    userId: '4D9NDNHh5JR06wQg8QbaMTqPwFD2',
    paymentAmount: '4500',
    bankTransferCode: '201843',
    ticketId: null,
    status: 0,
    updatedAt: null,
    purchasedAt: null,
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 0,
    totalAmount: '4500',
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP01208D298LPLA8ZA',
    id: 'VWrKBrLLihbhskd5ZbPn'
  },
  {
    paymentProductId: 'price_1NXSt3GphU7BtaJH8KvZMaH9',
    createdAt: {
      _seconds: 1710671846,
      _nanoseconds: 503000000
    },
    paymentMethod: 1,
    applicationId: null,
    userId: '4D9NDNHh5JR06wQg8QbaMTqPwFD2',
    paymentAmount: 1500,
    bankTransferCode: '171937',
    ticketId: 'JSmOxyHhdqh6kaNIOEUt',
    paymentId: 'pi_3Pvj7lGphU7BtaJH0QcK46pU',
    status: 1,
    updatedAt: {
      _seconds: 1725555941,
      _nanoseconds: 210000000
    },
    purchasedAt: {
      _seconds: 1725555941,
      _nanoseconds: 0
    },
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 2,
    totalAmount: 1500,
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP0317847XVL7EJCZJ',
    id: 'WfSj5g0hFGXYYavruB9b'
  },
  {
    paymentProductId: 'price_1OLFuKGphU7BtaJH6hW0NDbs',
    createdAt: {
      _seconds: 1705757923,
      _nanoseconds: 281000000
    },
    paymentId: '',
    paymentMethod: 1,
    applicationId: 'thw0VJfXgYHhrfZvH8j9',
    userId: '4D9NDNHh5JR06wQg8QbaMTqPwFD2',
    paymentAmount: '4500',
    bankTransferCode: '202238',
    ticketId: null,
    status: 0,
    updatedAt: null,
    purchasedAt: null,
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 0,
    totalAmount: '4500',
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP0120TSR1K73DUNT3',
    id: 'X5h3PgR1D06Wv15SSSNr'
  },
  {
    paymentProductId: 'price_1OLFuKGphU7BtaJH6hW0NDbs',
    createdAt: {
      _seconds: 1705742368,
      _nanoseconds: 913000000
    },
    paymentId: '',
    paymentMethod: 1,
    applicationId: 'QxQzSFgsFKgO57KFfnR9',
    userId: '4D9NDNHh5JR06wQg8QbaMTqPwFD2',
    paymentAmount: '4500',
    bankTransferCode: '201819',
    ticketId: null,
    status: 0,
    updatedAt: null,
    purchasedAt: null,
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 0,
    totalAmount: '4500',
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP012080CKCBQDPPDX',
    id: 'Y41aRPFagKOMSGJBW9Ys'
  },
  {
    paymentProductId: 'price_1OLFuKGphU7BtaJH6hW0NDbs',
    createdAt: {
      _seconds: 1705741202,
      _nanoseconds: 297000000
    },
    paymentId: '',
    paymentMethod: 1,
    applicationId: '2jkMz9tBxkDrS4vdZvIv',
    userId: '4D9NDNHh5JR06wQg8QbaMTqPwFD2',
    paymentAmount: '4500',
    bankTransferCode: '201800',
    ticketId: null,
    status: 0,
    updatedAt: null,
    purchasedAt: null,
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 0,
    totalAmount: '4500',
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP0120STZ7TCHWFVS1',
    id: 'Ya3fHzpLF4tddcZe1BeM'
  },
  {
    paymentProductId: 'price_1OLFuKGphU7BtaJH6hW0NDbs',
    createdAt: {
      _seconds: 1705758232,
      _nanoseconds: 571000000
    },
    paymentId: '',
    paymentMethod: 1,
    applicationId: 'hmRLMPZ2L2OSfzeSHSiu',
    userId: '4D9NDNHh5JR06wQg8QbaMTqPwFD2',
    paymentAmount: '4500',
    bankTransferCode: '202243',
    ticketId: null,
    status: 0,
    updatedAt: null,
    purchasedAt: null,
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 0,
    totalAmount: '4500',
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP0120IR8DVQMRQB1I',
    id: 'YvARbervXVg3i6E4qGGQ'
  },
  {
    paymentProductId: 'price_1OLFuKGphU7BtaJH6hW0NDbs',
    createdAt: {
      _seconds: 1702209294,
      _nanoseconds: 924000000
    },
    paymentMethod: 1,
    applicationId: 'gc6M8IfPcEwrnZVZcuoJ',
    userId: 'A5G4ztk12LY2zl90UoVQhFY9Mwa2',
    paymentAmount: '4500',
    bankTransferCode: '102054',
    ticketId: null,
    paymentId: 'pi_3OLlbgGphU7BtaJH1VbinnfL',
    status: 1,
    updatedAt: {
      _seconds: 1702209340,
      _nanoseconds: 845000000
    },
    purchasedAt: {
      _seconds: 1702209340,
      _nanoseconds: 0
    },
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 2,
    totalAmount: '4500',
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP1210JCAMNOPFWOUT',
    id: 'bEjaKKXY8JNjpvyrQhem'
  },
  {
    paymentProductId: '',
    createdAt: {
      _seconds: 1715872222,
      _nanoseconds: 828000000
    },
    paymentId: '',
    paymentMethod: 1,
    applicationId: 'BCiB7HnIX3MpQEMwMrvi',
    userId: 'rL8hhEZXSgeLut29OuAIziN5uQ72',
    paymentAmount: 4500,
    bankTransferCode: '170010',
    ticketId: null,
    status: 0,
    updatedAt: null,
    purchasedAt: null,
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 0,
    totalAmount: 4500,
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP0517QHVHCESEZNID',
    id: 'e6LcPgAZ9HzL7tHuPIds'
  },
  {
    paymentProductId: 'price_1NXSt3GphU7BtaJH8KvZMaH9',
    createdAt: {
      _seconds: 1718689863,
      _nanoseconds: 876000000
    },
    paymentId: '',
    paymentMethod: 2,
    applicationId: null,
    userId: '4D9NDNHh5JR06wQg8QbaMTqPwFD2',
    paymentAmount: 1500,
    bankTransferCode: '181450',
    ticketId: 'j0XLydsT0EAfi3L9AADM',
    updatedAt: null,
    status: 1,
    purchasedAt: null,
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 2,
    totalAmount: 1500,
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP0618D1EYRE0EEXHR',
    id: 'f4er9yK2LjphROBWYV9v'
  },
  {
    paymentProductId: 'price_1OuUUnFiQHtnurDviwgV05M4',
    createdAt: {
      _seconds: 1710618722,
      _nanoseconds: 697000000
    },
    paymentMethod: 1,
    applicationId: 'fkX14nXZOuzdRacHFhSJ',
    userId: 'kJYh5JyAVzcSfdZFcYJJcN9M8Ek2',
    paymentAmount: 3000,
    bankTransferCode: '170451',
    ticketId: null,
    paymentId: 'pi_3Ov3KsFiQHtnurDv1k0EUNsJ',
    status: 1,
    updatedAt: {
      _seconds: 1710618970,
      _nanoseconds: 680000000
    },
    purchasedAt: {
      _seconds: 1710618970,
      _nanoseconds: 0
    },
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 2,
    totalAmount: 3000,
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP0317IXUOTCYYEF6G',
    id: 'gOrwpKZ1PzvYghJH03hn'
  },
  {
    paymentProductId: '',
    createdAt: {
      _seconds: 1723209027,
      _nanoseconds: 810000000
    },
    paymentId: '',
    paymentMethod: 1,
    applicationId: 'AIN6AvOuSbswl2YdjMvh',
    userId: '4D9NDNHh5JR06wQg8QbaMTqPwFD2',
    paymentAmount: 4500,
    bankTransferCode: '092210',
    ticketId: null,
    checkoutSessionId: 'cs_test_a1ocDoZJsb4g7LMAlfAI6vgEvEWI9oZ6JBDinDZ16bMC6RyluYBAJFWsMn',
    paymentIntentId: 'pi_3R5PGFGphU7BtaJH05fQYrHe',
    cardBrand: 'visa',
    status: 1,
    updatedAt: {
      _seconds: 1742639201,
      _nanoseconds: 487000000
    },
    checkoutStatus: 2,
    totalAmount: 4500,
    voucherAmount: 0,
    purchasedAt: {
      _seconds: 1742639201,
      _nanoseconds: 0
    },
    voucherId: null,
    hashId: 'SP08097721B9QQ5MZH',
    id: 'hST7zPub7h4zCou1Jjm4'
  },
  {
    userId: '4D9NDNHh5JR06wQg8QbaMTqPwFD2',
    hashId: 'SP0323JKNRJAQUN1NP',
    paymentMethod: 1,
    checkoutSessionId: 'cs_test_a1eXMJf63LogCFgeKVqlf7LlacAHvSqw8fcdDDYN4SwkqRwY9qX20tAO59',
    bankTransferCode: '230022',
    paymentAmount: 4000,
    totalAmount: 4500,
    voucherAmount: 500,
    voucherId: 'rXMEuC4YM97IHaXOk9uq',
    applicationId: 'LpMOOWkwPmXI2hYzw6JO',
    ticketId: null,
    createdAt: {
      _seconds: 1742656950,
      _nanoseconds: 372000000
    },
    paymentIntentId: 'pi_3R5Tt1GphU7BtaJH1ZlGD3Kw',
    purchasedAt: {
      _seconds: 1742656980,
      _nanoseconds: 532000000
    },
    cardBrand: 'visa',
    status: 1,
    updatedAt: {
      _seconds: 1742656980,
      _nanoseconds: 532000000
    },
    checkoutStatus: 2,
    id: 'hgEgqdRxmxh54O8NaUmn'
  },
  {
    paymentProductId: 'price_1OLFuKGphU7BtaJH6hW0NDbs',
    createdAt: {
      _seconds: 1705744420,
      _nanoseconds: 106000000
    },
    paymentId: '',
    paymentMethod: 1,
    applicationId: 'hATmzdnYD6SOMn3wRTrt',
    userId: '4D9NDNHh5JR06wQg8QbaMTqPwFD2',
    paymentAmount: '4500',
    bankTransferCode: '201853',
    ticketId: null,
    status: 0,
    updatedAt: null,
    purchasedAt: null,
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 0,
    totalAmount: '4500',
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP0120FXKNX53FX8H3',
    id: 'i1UJUXWVjlyaggQJmH02'
  },
  {
    paymentProductId: 'price_1OLFuKGphU7BtaJH6hW0NDbs',
    createdAt: {
      _seconds: 1705741660,
      _nanoseconds: 614000000
    },
    paymentId: '',
    paymentMethod: 1,
    applicationId: 'a2LFz6B4oL6ebftQhSaP',
    userId: '4D9NDNHh5JR06wQg8QbaMTqPwFD2',
    paymentAmount: '4500',
    bankTransferCode: '201807',
    ticketId: null,
    status: 0,
    updatedAt: null,
    purchasedAt: null,
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 0,
    totalAmount: '4500',
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP0120KHML1D6AOYWU',
    id: 'ogJSWo1oGxPpfGpdLD9E'
  },
  {
    paymentProductId: 'price_1NXSt3GphU7BtaJH8KvZMaH9',
    createdAt: {
      _seconds: 1718611886,
      _nanoseconds: 318000000
    },
    paymentMethod: 1,
    applicationId: null,
    userId: '4D9NDNHh5JR06wQg8QbaMTqPwFD2',
    paymentAmount: 1500,
    bankTransferCode: '171711',
    ticketId: '6h9LzKhu7OX77L7sRdLh',
    paymentId: 'pi_3Pvj8KGphU7BtaJH1mtUYDNg',
    status: 1,
    updatedAt: {
      _seconds: 1725555974,
      _nanoseconds: 19000000
    },
    purchasedAt: {
      _seconds: 1725555974,
      _nanoseconds: 0
    },
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 2,
    totalAmount: 1500,
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP0617OCZ4GIOG64HR',
    id: 'qhkn0IOkTMKEaIIRUkpf'
  },
  {
    paymentProductId: 'price_1NXSt3GphU7BtaJH8KvZMaH9',
    createdAt: {
      _seconds: 1710502996,
      _nanoseconds: 682000000
    },
    paymentId: '',
    paymentMethod: 2,
    applicationId: null,
    userId: '4D9NDNHh5JR06wQg8QbaMTqPwFD2',
    paymentAmount: 1500,
    bankTransferCode: '152043',
    ticketId: 'OZiGCBFcqOcu1INp5ihe',
    status: 0,
    updatedAt: null,
    purchasedAt: null,
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 0,
    totalAmount: 1500,
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP0315CDDU7WNREAON',
    id: 'sKNk6FBxUFN2maIrsfde'
  },
  {
    paymentProductId: 'price_1OLFuKGphU7BtaJH6hW0NDbs',
    createdAt: {
      _seconds: 1705745966,
      _nanoseconds: 27000000
    },
    paymentId: '',
    paymentMethod: 1,
    applicationId: 'OpZuC2RjZ5835vDqMNGX',
    userId: '4D9NDNHh5JR06wQg8QbaMTqPwFD2',
    paymentAmount: '4500',
    bankTransferCode: '201919',
    ticketId: null,
    status: 0,
    updatedAt: null,
    purchasedAt: null,
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 0,
    totalAmount: '4500',
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP0120DTBSK8R46BTQ',
    id: 'sLk27MnjWH5gTj20rbFV'
  },
  {
    paymentProductId: 'price_1OLFuKGphU7BtaJH6hW0NDbs',
    createdAt: {
      _seconds: 1705743341,
      _nanoseconds: 286000000
    },
    paymentId: '',
    paymentMethod: 1,
    applicationId: 'aMmMQPMb2dIZ6qvndQcX',
    userId: '4D9NDNHh5JR06wQg8QbaMTqPwFD2',
    paymentAmount: '4500',
    bankTransferCode: '201835',
    ticketId: null,
    status: 0,
    updatedAt: null,
    purchasedAt: null,
    paymentIntentId: '',
    checkoutSessionId: '',
    checkoutStatus: 0,
    totalAmount: '4500',
    voucherAmount: 0,
    voucherId: null,
    hashId: 'SP0120CODCDXOM5O6G',
    id: 'uZwicHXTDXcm1YkcQnHT'
  }
]

const main = async () => {
  // const payments = await db.collection('_payments').get()
  // const paymentsWithId = payments.docs.map(doc => ({ ...doc.data(), id: doc.id }))
  // fs.mkdirSync('out', { recursive: true })
  // fs.writeFile('out/payments.json', JSON.stringify(paymentsWithId, null, 2), () => {})

  const targetPayments = mock.filter(p => typeof p.paymentAmount === 'string')
    .map(p => ({
      id: p.id,
      hashId: generateHashId(new Date(p.createdAt._seconds * 1000)),
      purchasedAt: p.updatedAt ? new Date(p.updatedAt._seconds * 1000) : null,
      userId: p.userId,
      checkoutSessionId: p.checkoutSessionId ?? '',
      paymentIntentId: p.paymentIntentId ?? '',
      checkoutStatus: p.status === 0 ? 0 : 2,
      totalAmount: Number(p.paymentAmount),
      voucherAmount: 0,
      voucherId: null
    }))

  // console.log(targetPayments)

  // db.runTransaction(async tx => {
  //   targetPayments.forEach(p => {
  //     const paymentRef = db.doc(`_payments/${p.id}`)
  //     tx.set(paymentRef, {
  //       hashId: p.hashId,
  //       purchasedAt: p.purchasedAt,
  //       checkoutSessionId: p.checkoutSessionId,
  //       paymentIntentId: p.paymentIntentId,
  //       checkoutStatus: p.checkoutStatus,
  //       paymentAmount: p.totalAmount,
  //       totalAmount: p.totalAmount,
  //       voucherAmount: p.voucherAmount,
  //       voucherId: p.voucherId
  //     }, { merge: true })

  //   const paymentHashRef = db.doc(`_paymentHashes/${p.hashId}`)
  //   tx.set(paymentHashRef, { userId: p.userId, paymentId: p.id, hashId: p.hashId })
  // })
  // })
}

main()
