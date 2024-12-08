import { motion } from 'framer-motion'
import { LoaderPinwheel } from 'lucide-react'

export default function LoadingSpinner() {
    return (
        <motion.div
            className="p-2"
            transition={{
                repeat: Infinity,
                repeatType: "loop",
                duration: 2,
                ease:"linear"
            }}
            animate={{
            rotate:360
        }}>
            <LoaderPinwheel size={16} />
        </motion.div>
    )
}