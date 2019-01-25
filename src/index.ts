import { ping, IPingResult } from './ping'
import { timer, BehaviorSubject, Observable } from 'rxjs'
import { flatMap, takeUntil, filter, tap } from 'rxjs/operators'
import { reader } from 'typescript-monads'
import { demandOption } from 'yargs'
export * from './ping'

export interface IOptionalConfig {
  readonly port: number
  readonly timeout: number
  readonly attempts: number
}

export interface IConfig extends Partial<IOptionalConfig> {
  readonly host: string
}

export const pingt =
  (host: string) =>
    (port = 80) =>
      (timeout = 1000) =>
        (attempts = 5) => {
          console.log('\n')
          console.log('ping-rx')

          const sub = new BehaviorSubject<number>(0)
          return timer(0, timeout).pipe(
            flatMap(_ => ping(host)(port)(timeout)),
            tap(() => sub.next(sub.getValue() + 1)),
            takeUntil(sub.pipe(filter(x => x > attempts)))
          )
        }

export const pingr = reader<IConfig, Observable<IPingResult>>(config => pingt(config.host)(config.port)(config.timeout)(config.attempts))

export const pingcli = () => {
  const args = demandOption('h', 'hostname is required')
    .alias('h', 'hostname')
    .alias('p', 'port')
    .alias('t', 'timeout')
    .alias('a', 'attempts')
    .argv

  pingr.run(args as any).subscribe(res => {
    res.match({
      fail: a => console.log(1),
      ok: a => console.log(2)
    })
  })
}