/// <reference types="node" />
import { Transform } from 'stream';
declare function build(options: any): Promise<Transform & import("pino-abstract-transport").OnUnknown>;
export default build;
