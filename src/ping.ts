import { Observable, Observer } from 'rxjs'
import { IResult, ok, fail } from 'typescript-monads'
import { Socket } from 'net'

export interface ScanResult {
  readonly port: number
  readonly host: string
}

export interface ScanError extends ScanResult {
  readonly error: Error
}

export type IPingResult = IResult<ScanResult, ScanError>

export const ping =
  (host: string) =>
    (port = 80) =>
      (timeout = 1000): Observable<IPingResult> =>
        Observable.create((obs: Observer<IPingResult>) => {
          const sock = new Socket()

          const _ok = () => {
            sock.destroy()
            obs.next(ok({ host, port }))
            obs.complete()
          }

          const _fail = (outerError?: any) => (innerError: any) => {
            sock.destroy()
            obs.next(fail({ host, port, error: outerError || innerError }))
            obs.complete()
          }

          sock.setTimeout(timeout)
          sock.connect(port, host, _ok)
          sock.on('error', _fail())
          sock.on('timeout', _fail(new Error('timeout')))
        })
