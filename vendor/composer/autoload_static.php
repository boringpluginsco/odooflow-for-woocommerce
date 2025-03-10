<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInitc66fe914dfef948cfb481931dc79b9d1
{
    public static $files = array (
        '4ab7985050624ba0bbd4489592ea8c98' => __DIR__ . '/..' . '/phpxmlrpc/polyfill-xmlrpc/bootstrap.php',
    );

    public static $prefixLengthsPsr4 = array (
        'P' => 
        array (
            'PhpXmlRpc\\Polyfill\\XmlRpc\\' => 26,
            'PhpXmlRpc\\' => 10,
        ),
    );

    public static $prefixDirsPsr4 = array (
        'PhpXmlRpc\\Polyfill\\XmlRpc\\' => 
        array (
            0 => __DIR__ . '/..' . '/phpxmlrpc/polyfill-xmlrpc/src',
        ),
        'PhpXmlRpc\\' => 
        array (
            0 => __DIR__ . '/..' . '/phpxmlrpc/phpxmlrpc/src',
        ),
    );

    public static $classMap = array (
        'Composer\\InstalledVersions' => __DIR__ . '/..' . '/composer/InstalledVersions.php',
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->prefixLengthsPsr4 = ComposerStaticInitc66fe914dfef948cfb481931dc79b9d1::$prefixLengthsPsr4;
            $loader->prefixDirsPsr4 = ComposerStaticInitc66fe914dfef948cfb481931dc79b9d1::$prefixDirsPsr4;
            $loader->classMap = ComposerStaticInitc66fe914dfef948cfb481931dc79b9d1::$classMap;

        }, null, ClassLoader::class);
    }
}
