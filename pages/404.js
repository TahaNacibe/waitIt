import Image from "next/image"

export default function NotFoundPage() {
    return (
        <section className="h-screen flex items-center justify-center">
            <Image width={500} height={500} src='/ilu/404_error.svg' className="w-1/2" alt='' />
        </section>
    )
}