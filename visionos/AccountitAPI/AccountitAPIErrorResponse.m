#import <AccountitAPI/AccountitAPIErrorResponse.h>

@implementation AccountitAPIErrorDetail

- (NSString * _Nullable)field {
    return [self stringForKey:@"field"];
}

- (NSString * _Nullable)message {
    return [self stringForKey:@"message"];
}

@end

@interface AccountitAPIErrorResponse () {
    NSArray<AccountitAPIErrorDetail *> * _Nonnull _details;
}
@end

@implementation AccountitAPIErrorResponse

@synthesize details = _details;

- (instancetype _Nonnull)initWithDictionary:(NSDictionary<NSString *, id> * _Nonnull)dictionary {
    self = [super initWithDictionary:dictionary];

    if (self) {
        _details = [[self arrayForKey:@"details" itemClass:[AccountitAPIErrorDetail class]] copy];
    }

    return self;
}

- (NSInteger)statusCode {
    NSNumber *number = [self numberForKey:@"statusCode"];

    if (!number) {
        return 0;
    }

    return [number integerValue];
}

- (NSString * _Nullable)errorCode {
    return [self stringForKey:@"errorCode"];
}

- (NSString * _Nullable)message {
    return [self stringForKey:@"message"];
}

- (NSString * _Nullable)path {
    return [self stringForKey:@"path"];
}

- (NSString * _Nullable)timestamp {
    return [self stringForKey:@"timestamp"];
}

- (void)dealloc {
    [_details release];
    [super dealloc];
}

@end
