interface PrettyOption {
    destination?: number | {
        write: () => void;
    };
    append?: boolean;
    mkdir?: boolean;
    sync?: boolean;
}
declare function build(options: PrettyOption): any;
export default build;
