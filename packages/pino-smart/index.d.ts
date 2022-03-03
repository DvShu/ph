/// <reference types="node" />
import { Transform } from 'stream';
interface PrettyOption {
    destination?: number | {
        write: () => void;
    };
    append?: boolean;
    mkdir?: boolean;
    sync?: boolean;
}
declare function build(options: PrettyOption): Transform & import("pino-abstract-transport").OnUnknown;
export default build;
