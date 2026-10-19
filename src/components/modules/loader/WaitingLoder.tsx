
import { DNA } from 'react-loader-spinner'

const WaitingLoader = () => {
    return (
        <div className='w-full h-full bg-[#00000046] absolute top-0 left-0  right-0 flex items-center justify-center'>
            <div className="w-full h-full relative">
                <div className="sticky top-0 left-0 right-0 h-screen w-full flex items-center justify-center">
                    <DNA
                        visible={true}
                        height="100"
                        width="100"
                        ariaLabel="dna-loading"
                        wrapperStyle={{}}
                        wrapperClass="dna-wrapper"
                    />
                </div>
            </div>

        </div>
    )
}

export default WaitingLoader