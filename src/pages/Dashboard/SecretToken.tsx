import { useRecoilValue } from "recoil";
import { SecretAtom } from "../../utils/atoms";

export default function SecretTokenPage() {
    const secret = useRecoilValue(SecretAtom)

    return (<section>
        {secret}
    </section>)
}