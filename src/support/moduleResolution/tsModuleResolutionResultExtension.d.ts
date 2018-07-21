/* note: You can extend interfaces.
 * Like, re-open them and add properties.
 * This cannot be a good idea, especially with required properties
 * Buuuuut hey, this is a demo project 
 * and I just learned this trick today while reading the spec
 * wahahahahaha!
 */
interface ModuleResolutionResult {
    usedTsConfig?: boolean
}