import compression from 'compression'

const compressionMiddleware = () => {
    return compression({
        filter: (req, res) => {
            if (req.headers['x-no-compression']) {
                return false
            }
            return compression.filter(req, res)
        },
    })
}

export default compressionMiddleware
