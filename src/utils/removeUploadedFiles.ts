import fs from 'fs'
import util from 'util'

const unlinkAsync = util.promisify(fs.unlink)

export const removeUploadedFiles = async (files: any) => {
  await Promise.all(
    ['productImages', 'variantsImages', 'productVideo'].flatMap(field =>
      files[field]
        ? files[field].map((file: Express.Multer.File) =>
            unlinkAsync(file.path).catch(err => {
              console.error('Failed to remove file:', file.path, err)
            })
          )
        : []
    )
  )
}
