#import <AccountitAPI/AccountitAPIFileDownloadResponse.h>

@interface AccountitAPIFileDownloadResponse () {
    NSData * _Nonnull _data;
    NSString * _Nullable _contentType;
    NSString * _Nullable _suggestedFilename;
}
@end

@implementation AccountitAPIFileDownloadResponse

@synthesize data = _data;
@synthesize contentType = _contentType;
@synthesize suggestedFilename = _suggestedFilename;

+ (BOOL)supportsSecureCoding {
    return YES;
}

- (instancetype _Nonnull)initWithDictionary:(NSDictionary<NSString *, id> * _Nonnull)dictionary {
    self = [super initWithDictionary:dictionary];

    if (self) {
        _data = [[NSData alloc] init];
        _contentType = nil;
        _suggestedFilename = nil;
    }

    return self;
}

- (instancetype _Nonnull)initWithData:(NSData * _Nonnull)data response:(NSURLResponse * _Nullable)response {
    NSDictionary *emptyDictionary = [[NSDictionary alloc] init];
    self = [super initWithDictionary:emptyDictionary];
    [emptyDictionary release];

    if (self) {
        _data = [data copy];
        _contentType = [[response MIMEType] copy];
        _suggestedFilename = [[response suggestedFilename] copy];
    }

    return self;
}

- (instancetype _Nullable)initWithCoder:(NSCoder * _Nonnull)coder {
    self = [super initWithCoder:coder];

    if (self) {
        NSData *data = [[coder decodeObjectOfClass:[NSData class] forKey:@"data"] retain];
        NSString *contentType = [[coder decodeObjectOfClass:[NSString class] forKey:@"contentType"] retain];
        NSString *suggestedFilename = [[coder decodeObjectOfClass:[NSString class] forKey:@"suggestedFilename"] retain];

        [_data release];

        if (data) {
            _data = [data copy];
        } else {
            _data = [[NSData alloc] init];
        }

        [_contentType release];
        _contentType = [contentType copy];

        [_suggestedFilename release];
        _suggestedFilename = [suggestedFilename copy];

        [data release];
        [contentType release];
        [suggestedFilename release];
    }

    return self;
}

- (void)encodeWithCoder:(NSCoder * _Nonnull)coder {
    [super encodeWithCoder:coder];
    [coder encodeObject:_data forKey:@"data"];
    [coder encodeObject:_contentType forKey:@"contentType"];
    [coder encodeObject:_suggestedFilename forKey:@"suggestedFilename"];
}

- (id _Nonnull)copyWithZone:(NSZone * _Nullable)zone {
    AccountitAPIFileDownloadResponse *copy = [[[self class] allocWithZone:zone] initWithData:_data response:nil];

    [copy->_contentType release];
    copy->_contentType = [_contentType copy];

    [copy->_suggestedFilename release];
    copy->_suggestedFilename = [_suggestedFilename copy];

    return copy;
}

- (void)dealloc {
    [_data release];
    [_contentType release];
    [_suggestedFilename release];
    [super dealloc];
}

@end
